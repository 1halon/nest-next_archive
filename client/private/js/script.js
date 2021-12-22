fetch("/login", {
    method: "POST",
    body: JSON.stringify({
        _timestamp: Date.now(),
        email: "test",
        password: "asd"
    })
});