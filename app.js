const apiUrl = "https://6adea6fc4e88f1bba4a53b90.mockapi.io/Students";
let members = [];
let editId = null;

function clearForm() {
    document.querySelector("#name").value = "";
    document.querySelector("#studentId").value = "";
    document.querySelector("#nickName").value = "";
    document.querySelector("#attendence").value = "";
    document.querySelector("#phone").value = "";
    editId = null;
    document.querySelector("#addBtn").textContent = "등록";
    document.querySelector("#cancelBtn").hidden = true;
}

function clickVaildName() {
    const input = document.querySelector("#name");
    if (input.value.trim().length < 2) {
        alert("이름을 2글자 이상 입력하세요.");
        input.focus();
        return false;
    }
    return true;
}

function clickVaildStudentIdNum() {
    const input = document.querySelector("#studentId");
    if (input.value.trim().length !== 8 || !input.checkValidity()) {
        alert("학번은 16~26으로 시작하는 8자리 숫자로 입력하세요.");
        input.focus();
        return false;
    }
    return true;
}

function clickVaildAttendenceNum() {
    const input = document.querySelector("#attendence");
    if (!input.checkValidity()) {
        alert("출석 횟수는 숫자만 입력");
        input.focus();
        return false;
    }
    return true;
}

async function loadMembers() {
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("목록 조회 실패 (HTTP " + response.status + ")");
    }
    members = await response.json();
    render();
}

async function addMember(person) {
    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(person)
    });
    if (!response.ok) {
        throw new Error("등록 실패 (HTTP " + response.status + ")");
    }
}

async function updateMember(id, person) {
    const response = await fetch(apiUrl + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(person)
    });
    if (!response.ok) {
        throw new Error("수정 실패 (HTTP " + response.status + ")");
    }
}

function render() {
    const list = document.getElementById("java_auto_add_theMemberList");
    list.replaceChildren();
    const keyword = document.querySelector("#search").value.trim();
    const result = members.filter(function (person) {
        return keyword === "" || person.name === keyword || person.nickName === keyword;
    });
    result.forEach(function (person) {
        const row = document.createElement("tr");
        [person.name, person.studentId, person.nickName, person.attendence, person.phone].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        const editCell = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "btn btn-success";
        editBtn.textContent = "수정";
        editBtn.addEventListener("click", function () {

            document.querySelector("#name").value = person.name;
            document.querySelector("#studentId").value = person.studentId;
            document.querySelector("#nickName").value = person.nickName;
            document.querySelector("#attendence").value = person.attendence;
            document.querySelector("#phone").value = person.phone;
            editId = person.id;
            document.querySelector("#addBtn").textContent = "등록";
            document.querySelector("#cancelBtn").hidden = false;

        });
        editCell.appendChild(editBtn);
        row.appendChild(editCell);
        const deleteCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "btn btn-danger";
        deleteBtn.textContent = "삭제";
        deleteBtn.addEventListener("click", function () {
            deleteMember(person.id);
        });
        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);
        list.appendChild(row);
    });
}

async function saveMember(event) {
    event.preventDefault();

    if (!(clickVaildName() && clickVaildStudentIdNum() && clickVaildAttendenceNum())) return;
    const person = {
        name: document.querySelector("#name").value.trim(),
        studentId: document.querySelector("#studentId").value.trim(),
        nickName: document.querySelector("#nickName").value.trim(),
        attendence: document.querySelector("#attendence").value * 1,
        phone: document.querySelector("#phone").value.trim()
    };

    try {
        if (editId === null) {
            await addMember(person);
        } else {
            await updateMember(editId, person);
        }
        clearForm();
        alert("저장되었습니다.");
        try {
            await loadMembers();
        } catch (error) {
            alert("저장은 완료되었습니다. 브라우저에서 페이지를 다시 열어주세요.");
        }
    } catch (error) {
        alert(error.message);
    }

}

async function deleteMember(id) {

    if (!confirm("삭제하면 되돌릴 수 없습니다. 삭제하시겠습니까?")) return;

    try {
        const response = await fetch(apiUrl + "/" + id, { method: "DELETE" });
        if (!response.ok) {
            throw new Error("삭제 실패 (HTTP " + response.status + ")");
        }
        if (editId === id) clearForm();
        alert("삭제되었습니다.");
        try {
            await loadMembers();
        } catch (error) {
            alert("삭제는 완료되었습니다. 브라우저에서 페이지를 다시 열어주세요.");
        }
    } catch (error) {
        alert(error.message);
    }

}

window.addEventListener("load", async function () {
    document.querySelector("#memberForm").addEventListener("submit", saveMember);
    document.querySelector("#search").addEventListener("input", function () {

        render();
    });
    document.querySelector("#cancelBtn").addEventListener("click", function () {
        clearForm();

    });
    try {
        await loadMembers();
    } catch (error) {
        alert(error.message);
    }
});
