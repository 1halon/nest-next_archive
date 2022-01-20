const email = "halilkochan48@gmail.com", username = "halon";
function register() {
    fetch("/api/v1/auth/register", {
        body: JSON.stringify({
            display_name: "HALON",
            email: email,
            username: username
        }),
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST"
    });
}
//ASd

function confirm(id, pass) {
    fetch("/api/v1/auth/confirm", {
        body: JSON.stringify({
            id: id,
            pass: pass
        }),
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST"
    });
}

function login(token) {
    fetch("/api/v1/auth/login", {
        body: JSON.stringify({
            email: email,
            login_token: token,
            username: username
        }),
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST"
    });
}

//register();
//login("3LC1JogtgKx4gjCH4WFUFeu87QGLGyU4zNNzkcKDDTDsHXk0rEqSAWWM0W1y2EoN");