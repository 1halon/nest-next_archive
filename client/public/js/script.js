const email = "halilkochan48@gmail.com", username = "halon";
function register() {
    fetch("/api/auth/register", {
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

function confirm(id, pass) {
    fetch("/api/auth/confirm", {
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
    fetch("/api/auth/login", {
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
//login("cwcF7l219LNRGKtQ8NsIYqVO72PMWrqO8zPOYOJeDnrTkqeNZ2IkcA0uw3nsCIGZ");