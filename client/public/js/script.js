const a="halilkochan48@gmail.com",b="halon";function c(){fetch("/api/v1/auth/register",{body:JSON.stringify({display_name:"HALON",email:a,username:b}),headers:{"Content-Type":"application/json"},method:"POST"})}function d(a,b){fetch("/api/v1/auth/confirm",{body:JSON.stringify({id:a,pass:b}),headers:{"Content-Type":"application/json"},method:"POST"})}function e(c){fetch("/api/v1/auth/login",{body:JSON.stringify({email:a,login_token:c,username:b}),headers:{"Content-Type":"application/json"},method:"POST"})}