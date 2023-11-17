const filesContainer = document.getElementById("filesContainer");
const formSubmissionElement = document.getElementById("formSubmission");

const createUnorderList = document.createElement("ul");
createUnorderList.setAttribute("class", "group-of-files");
const createNoFilesContainer = document.createElement("div");
createNoFilesContainer.setAttribute("class", "no-files-container");

const serverUrl = "https://file-uploader-back-end.onrender.com";
// const serverUrl = "http://localhost:3000";

const noFilesContainerFun = () => {
  const noFilesHeading = document.createElement("h1");
  noFilesHeading.textContent = "No Files In Your Database";
  const spanElement = document.createElement("span");
  spanElement.textContent = "Please add a file";
  createNoFilesContainer.appendChild(noFilesHeading);
  filesContainer.appendChild(createNoFilesContainer);
  createNoFilesContainer.append(spanElement);
};

const deleteFileFun = async (id) => {
  try {
    const url = `${serverUrl}/file/${id}`;
    const option = {
      method: "DELETE",
    };
    const response = await fetch(url, option);
    const data = await response.json();
    alert(data.message);
    location.reload();
  } catch (error) {
    console.log("Delete item Error : ", error);
  }
};

const showFilesContainer = (filesArray) => {
  filesContainer.appendChild(createUnorderList);
  filesArray.map((eachItem) => {
    console.log(eachItem);
    const listElement = document.createElement("li");
    listElement.setAttribute("class", "list-element");
    const imageElement = document.createElement("img");
    imageElement.src = `${eachItem.url}`; //"./Images/newspaper.jpg";
    imageElement.alt = eachItem.name;
    imageElement.setAttribute("class", "images");
    listElement.appendChild(imageElement);
    createUnorderList.appendChild(listElement);
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    listElement.appendChild(deleteBtn);
    deleteBtn.setAttribute("class", "delete-btn");
    deleteBtn.addEventListener("click", () => {
      deleteFileFun(eachItem._id);
    });
  });
};

const createFileInDB = async (formData) => {
  try {
    const url = `${serverUrl}/file`;
    const option = {
      method: "POST",
      body: formData,
    };
    const response = await fetch(url, option);
    const data = await response.json();
    alert(data.message);
    location.reload();
  } catch (error) {
    console.log("Upload file Error: ", error);
  }
};

formSubmissionElement.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  createFileInDB(formData);
});

const getFilesFromDB = async () => {
  try {
    const response = await fetch(`${serverUrl}/file`);
    const data = await response.json();
    console.log("This is from DB", data.files);
    if (data.files.length === 0) {
      noFilesContainerFun();
    } else {
      showFilesContainer(data.files);
    }
  } catch (error) {
    console.log("Getting files Error:", error);
  }
};
getFilesFromDB();
