setTimeout(function () {
  $(".flash-alert")
    .fadeTo(500, 0)
    .slideUp(500, function () {
      $(this).remove();
    });
}, 3000);

const handleImage = () => {
  document.getElementById("hiddenImageInput").click();
};

const addBtn = document.getElementById("addImage");
addBtn.addEventListener("click", handleImage);

const showImagesBtn = document.getElementById("campImages");
const showDiv = document.getElementById("showCampImages");

showImagesBtn.addEventListener("click", () => {
  showDiv.classList.toggle("d-none");
});

$("#hiddenImageInput").change(function () {
  const files = $(this)[0].files;
  const fileName = [];
  if (files) {
    for (let file in files) {
      if (files.hasOwnProperty(file)) {
        fileName.push(files[file].name);
      }
    }
  }
  $("#filesDisplay").attr("placeholder", fileName.join(", "));
  $("#filesDisplay")
    .next("span")
    .removeClass("d-none")
    .text(files.length)
    .css({ color: "green", "font-weight": "700" });
});
