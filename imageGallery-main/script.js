// =================== CONFIG ===================
const { blobUrl, sasToken, containerName, analyzeUrl, imagesUrl, deleteUrl } = window.GALLERY_CONFIG;
const ANALYZE_URL = analyzeUrl;
const IMAGES_URL = imagesUrl;
const DELETE_URL = deleteUrl;


// =================== UI ELEMENTS ===================
const albumSelect = document.getElementById("albumSelector");
const gallery = document.getElementById("gallery");
const fileInput = document.getElementById("fileInput");
const newAlbumInput = document.getElementById("newAlbum");


// =================== LOAD ALBUM IMAGES ===================
async function loadAlbum(album) {
  if (!album) album = albumSelect.value;

  if (!album) {
    gallery.innerHTML = `<p class="text-gray-400 text-center">Create or select an album to see its images.</p>`;
    return;
  }

  gallery.innerHTML = `<p class="text-gray-500">Loading...</p>`;

  try {
    const imagesUrl = new URL(IMAGES_URL);
    imagesUrl.searchParams.set("album", album);
    const res = await fetch(imagesUrl);
    if (!res.ok) throw new Error(`Could not load images (HTTP ${res.status}).`);
    const data = await res.json();

    gallery.innerHTML = "";

    if (!data.length) {
      gallery.innerHTML = `<p class="text-gray-400 text-center">No images in this album.</p>`;
      return;
    }

    renderGallery(data);
  } catch (error) {
    gallery.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
  }
}


// =================== RENDER IMAGES ===================
function renderGallery(images) {
  gallery.innerHTML = "";

  images.forEach(img => {
    const card = document.createElement("div");
    card.className = "img-card";

    card.innerHTML = `
      <img src="${img.url}" class="photo"/>

      <div class="p-4">
        <p class="font-semibold text-gray-800 mb-1">
          ${img.caption || "No caption"}
        </p>

        <p class="text-xs text-gray-500 mb-3">
          ${(img.tags || []).join(", ")}
        </p>

        <button 
          class="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
          onclick="deleteImage('${img.album}', '${img.name}')">
          Delete
        </button>
      </div>
    `;

    gallery.appendChild(card);
  });
}


// =================== CREATE ALBUM ===================
function createAlbum() {
  let album = newAlbumInput.value.trim();
  if (!album) return alert("Enter album name");

  let opt = document.createElement("option");
  opt.value = album;
  opt.textContent = album;

  albumSelect.appendChild(opt);
  albumSelect.value = album;
  newAlbumInput.value = "";

  loadAlbum(album);
}


// =================== UPLOAD IMAGE ===================
async function uploadImage() {
  const file = fileInput.files[0];
  let album = albumSelect.value;

  if (!file) return alert("Select a file!");

  if (newAlbumInput.value.trim()) {
    album = newAlbumInput.value.trim();
    let opt = document.createElement("option");
    opt.value = album;
    opt.textContent = album;
    albumSelect.appendChild(opt);
    albumSelect.value = album;
  }

  const blobName = file.name;
  const uploadUrl = `${blobUrl}/${containerName}/${album}/${blobName}?${sasToken}`;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "x-ms-blob-type": "BlockBlob" },
    body: file
  });

  if (!res.ok) return alert("Upload failed!");

  alert("Uploaded ✅ — AI analyzing...");

  const analyzeRes = await fetch(ANALYZE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album, name: blobName })
  });

  if (!analyzeRes.ok) return alert("Image uploaded, but AI analysis failed.");

  alert("Tagged + Stored ✅");
  loadAlbum(album);
}


// =================== DELETE IMAGE ===================
async function deleteImage(album, name) {
  if (!confirm("Delete this image?")) return;

  const res = await fetch(DELETE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album, name })
  });

  if (!res.ok) return alert("Delete failed.");
  const json = await res.json();
  console.log(json);

  loadAlbum(album);
}


// =================== INIT ===================
albumSelect.onchange = () => loadAlbum(albumSelect.value);
loadAlbum();

