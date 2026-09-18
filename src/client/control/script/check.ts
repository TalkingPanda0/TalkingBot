async function check() {
  const result = await fetch("/api/check", {
    redirect: "manual",
  });

  if (result.type === "opaqueredirect") {
    window.location.href = "/login";
  }
}

check();
