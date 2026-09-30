
      fetch("/api/profile-badge").then(function (r) { return r.json(); }).then(function (d) {
        if (!d || !d.ok) return;
        if (d.name) document.getElementById("founder-name").textContent = d.name;
        if (d.headline) document.getElementById("founder-headline").textContent = d.headline;
        if (d.photo_url) document.getElementById("founder-photo").innerHTML =
          '<img src="' + d.photo_url + '" alt="" data-u="u618aa59" loading="lazy">';
        if (d.linkedin_url) {
          var link = document.getElementById("founder-link");
          link.href = d.linkedin_url;
          link.style.display = "inline-block";
        }
      }).catch(function () {});
    