const palette = document.getElementById("palette");

for (let i = 1; i <= 35; i++) {
    const btn = document.createElement("div");
    btn.innerText = i;
    btn.onclick = () => alert("Go to Question " + i);
    palette.appendChild(btn);
}
