const API_BASE_URL =
    "http://localhost:3000/api";


function showMessage(
    text,
    success = false
) {

    const message =
        document.getElementById("message");

    if (!message) {

        return;

    }


    message.textContent = text;

    message.style.color =
        success
            ? "green"
            : "#b42318";

}


/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    showMessage(
                        data.message ||
                        "بيانات الدخول غير صحيحة."
                    );

                    return;

                }


                localStorage.setItem(
                    "token",
                    data.token
                );


                localStorage.setItem(
                    "userEmail",
                    email
                );


                showMessage(
                    "تم تسجيل الدخول بنجاح.",
                    true
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "map.html";

                    },
                    500
                );

            }

            catch (error) {

                showMessage(
                    "تعذر الاتصال بالسيرفر. شغّل الـ Backend أولاً."
                );

            }

        }
    );

}


/* =========================
   REGISTER
========================= */

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const confirmPassword =
                document
                    .getElementById(
                        "confirmPassword"
                    )
                    .value;


            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    "كلمتا المرور غير متطابقتين."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    showMessage(
                        data.message ||
                        "فشل إنشاء الحساب."
                    );

                    return;

                }


                showMessage(
                    "تم إنشاء الحساب بنجاح. سيتم نقلك لتسجيل الدخول.",
                    true
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    1000
                );

            }

            catch (error) {

                showMessage(
                    "تعذر الاتصال بالسيرفر. شغّل الـ Backend أولاً."
                );

            }

        }
    );

}