function valid() {
    var a = F.name.value;
    if (a.length < 1) {
        alert("Name field cannot be blank");
        return false;
    }
    var count = 0;
    for (i = 0; i < a.length; i++) {
        var ch = a.charCodeAt(i);
        if ((ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122) || (ch == 32))
            count++;
    }
    if (count != a.length) {
        alert("Name field cannot contain digits or other symbols");
        return false;
    }
    
    var em = F.email.value;
    if (em.length < 1) {
        alert("Email field cannot be blank");
        return false;
    }
    var pt2 = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!em.match(pt2)) {
        alert("Enter a valid email");
        return false;
    }
    var d = F.phone.value;
    if (d.length < 1) {
        alert("Phone field cannot be blank");
        return false;
    }
    if (d.length != 10) {
        alert("Phone field length must be 10");
        return false;
    }
    var pt = /^[0-9]+$/;
    if (!d.match(pt)) {
        alert("Enter only digits in the phone field");
        return false;
    }
    var b = F.password1.value;
    if (b.length < 1) {
        alert("Password field cannot be blank");
        return false;
    }
    if (b.length < 8) {
        alert("Password must contain at least 8 characters");
        return false;
    }
    var di = 0, up = 0, lw = 0, ot = 0;
    for (i = 0; i < b.length; i++) {
        var ch = b.charCodeAt(i);
        if (ch >= 65 && ch <= 90)
            up++;
        else if (ch >= 97 && ch <= 122)
            lw++;
        else if (ch >= 48 && ch <= 57)
            di++;
        else
            ot++;
    }
    if (up == 0) {
        alert("Password should have at least one uppercase letter");
        return false;
    }
    if (ot == 0) {
        alert("Password should have at least one symbol");
        return false;
    }
    var c = F.password2.value;
    if (b != c) {
        alert("Password and confirm password must be the same");
        return false;
    }

    return true;
}