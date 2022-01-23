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

function confirm(token) {
    fetch("/api/v1/auth/confirm?token=" + token, {
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
            token: token,
            username: username
        }),
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST"
    }).then(res => res.text()).then(token => confirm(token));
}

//register();
//login("MiDfkxmvOGh98Ug6ve1wyAGV6vdl3bmcySiuf9RF6sKzZcuKg1hbh4mM39qgkGCb")