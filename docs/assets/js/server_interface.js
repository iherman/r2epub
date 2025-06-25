// server_interface.ts
var epub_content_type = "application/epub+zip";
var storage_key = "r2epub";
function retrieve_server_data() {
  const stored_server_data = localStorage.getItem(storage_key);
  if (stored_server_data) {
    const server_data = JSON.parse(stored_server_data);
    const server = document.getElementById("serverChoice");
    const port = document.getElementById("portNumber");
    server.value = server_data.url;
    port.value = server_data.port;
  }
}
function store_server_data(url, port) {
  const server_data = {
    url,
    port
  };
  localStorage.setItem(storage_key, JSON.stringify(server_data));
}
async function fetch_book(resource_url) {
  let fname;
  let content_type;
  return new Promise((resolve, reject) => {
    try {
      window.fetch(resource_url, {
        mode: "cors"
      }).then((response) => {
        const ct = response.headers.get("Content-type");
        if (ct === null) {
          reject(new Error(`HTTP response did not include a content type on ${resource_url}`));
        } else {
          content_type = response.headers.get("Content-type") || "";
          if (response.ok) {
            fname = response.headers.get("Content-Disposition")?.split(";")[1].split("=")[1] || "";
            return response.blob();
          } else {
            if (response.status === 400) {
              return response.blob();
            } else {
              reject(new Error(`HTTP response ${response.status}: ${response.statusText} on ${resource_url}`));
            }
          }
        }
      }).then((content) => {
        if (content) {
          resolve({
            content_type,
            file_name: fname,
            content
          });
        } else {
          reject(new Error(`Empty content has been returned for ${resource_url}`));
        }
      }).catch((err) => {
        reject(new Error(`Problem accessing: ${err}`));
      });
    } catch (err) {
      reject(err);
    }
  });
}
var submit = async (event) => {
  const save_book = (data, name) => {
    const dataURL = URL.createObjectURL(data);
    const download = document.getElementById("download");
    download.href = dataURL;
    download.download = name;
    download.click();
  };
  const fading_success = () => {
    done.style.setProperty("visibility", "visible");
    setTimeout(() => done.style.setProperty("visibility", "hidden"), 3e3);
  };
  event.preventDefault();
  const done = document.getElementById("done");
  const progress = document.getElementById("progress");
  try {
    const url = document.getElementById("url");
    const respec = document.getElementById("respec");
    const publishDate = document.getElementById("publishDate");
    const specStatus = document.getElementById("specStatus");
    const addSectionLinks = document.getElementById("addSectionLinks");
    const maxTocLevel = document.getElementById("maxTocLevel");
    const server = document.getElementById("serverChoice");
    const port = document.getElementById("portNumber");
    if (!(url.value === null || url.value === "")) {
      const service = server.value.startsWith("http://localhost") ? `${server.value}:${port.value}` : server.value;
      const query = [
        `url=${url.value}`,
        `respec=${respec.value === "true"}`
      ];
      if (publishDate.value !== "") {
        query.push(`publishDate=${publishDate.value}`);
      }
      if (specStatus.value !== "null") {
        query.push(`specStatus=${specStatus.value}`);
      }
      if (addSectionLinks.value !== "null") {
        query.push(`addSectionLinks=${addSectionLinks.value}`);
      }
      if (maxTocLevel.value !== "") {
        query.push(`maxTocLevel=${maxTocLevel.value}`);
      }
      store_server_data(server.value, port.value);
      const service_url = `${service}?${query.join("&")}`;
      try {
        progress.style.setProperty("visibility", "visible");
        const returned = await fetch_book(service_url);
        if (returned.content_type === epub_content_type) {
          save_book(returned.content, returned.file_name);
        } else {
          const message = await returned.content.text();
          alert(message);
        }
        progress.style.setProperty("visibility", "hidden");
        if (returned.content_type === epub_content_type) fading_success();
      } catch (e) {
        progress.style.setProperty("visibility", "hidden");
        alert(`${e}`);
      }
    } else {
      alert(`No or empty URL value`);
    }
  } catch (e) {
    alert(`Form interpretation Error: ${e}`);
  }
};
window.addEventListener("load", () => {
  retrieve_server_data();
  const submit_button = document.getElementById("submit");
  if (submit_button) submit_button.addEventListener("click", submit);
});
