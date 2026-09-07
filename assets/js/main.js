function updateClock() {
  const now = new Date();

  // Formats the time as "8:33 PM"
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Formats the timezone as "GMT+8"
  const tzString = now
    .toLocaleDateString("en-US", {
      timeZoneName: "shortOffset",
    })
    .split(", ")[1]; // Extracts just the "GMT+8" part

  document.getElementById("header-clock").textContent =
    `${timeString} ${tzString}`;
}

// Updates the clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);
