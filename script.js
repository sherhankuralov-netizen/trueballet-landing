/* =========================================================
   TrueBallet — Landing scripts
   ========================================================= */
(function () {
    "use strict";

    var WHATSAPP_PHONE = "77017773684"; // номер основателя без "+" для wa.me

    /* ---------- 1. Плавный скролл к форме ---------- */
    document.querySelectorAll(".js-scroll").forEach(function (link) {
        link.addEventListener("click", function (e) {
            var target = document.querySelector("#form");
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            // мягкий фокус на первое поле после прокрутки
            window.setTimeout(function () {
                var name = document.getElementById("name");
                if (name) name.focus({ preventScroll: true });
            }, 600);
        });
    });

    /* ---------- 2. Анимации появления (IntersectionObserver) ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealEls.forEach(function (el) {
            io.observe(el);
        });
    } else {
        revealEls.forEach(function (el) {
            el.classList.add("is-visible");
        });
    }

    /* ---------- 3. Мобильная фиксированная кнопка ----------
       Прячем, пока пользователь видит hero (там уже есть своя кнопка)
       или пока дошёл до формы. Показываем только в промежутке. */
    var mobileCta = document.querySelector(".mobile-cta");
    var heroSection = document.getElementById("top");
    var formSection = document.getElementById("form");

    if (mobileCta && heroSection && "IntersectionObserver" in window) {
        var heroVisible = true;
        var formVisible = false;

        function updateMobileCta() {
            mobileCta.classList.toggle("hidden", heroVisible || formVisible);
        }

        var ctaObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.target === heroSection) {
                        heroVisible = entry.isIntersecting;
                    } else if (entry.target === formSection) {
                        formVisible = entry.isIntersecting;
                    }
                });
                updateMobileCta();
            },
            { threshold: 0.05 }
        );

        ctaObserver.observe(heroSection);
        if (formSection) ctaObserver.observe(formSection);
        updateMobileCta();
    }

    /* ---------- 4. Обработка формы → WhatsApp ---------- */
    var form = document.getElementById("lead-form");
    var hint = document.getElementById("form-hint");

    function setHint(msg, type) {
        if (!hint) return;
        hint.textContent = msg;
        hint.className = "lead-form__hint" + (type ? " " + type : "");
    }

    function digits(str) {
        return (str || "").replace(/\D/g, "");
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var nameEl = document.getElementById("name");
            var phoneEl = document.getElementById("phone");
            var cityEl = document.getElementById("city");

            var name = nameEl.value.trim();
            var phoneRaw = phoneEl.value.trim();
            var city = cityEl.value.trim();

            [nameEl, phoneEl, cityEl].forEach(function (el) {
                el.classList.remove("invalid");
            });

            var errors = [];
            if (name.length < 2) {
                errors.push(nameEl);
            }
            if (digits(phoneRaw).length < 10) {
                errors.push(phoneEl);
            }
            if (city.length < 2) {
                errors.push(cityEl);
            }

            if (errors.length) {
                errors.forEach(function (el) {
                    el.classList.add("invalid");
                });
                errors[0].focus();
                setHint("Пожалуйста, заполните имя, телефон и город.", "error");
                return;
            }

            var message =
                "Здравствуйте, Ерлан! Хочу узнать условия франшизы TrueBallet.\n\n" +
                "Имя: " + name + "\n" +
                "Телефон: " + phoneRaw + "\n" +
                "Город: " + city;

            var url =
                "https://wa.me/" + WHATSAPP_PHONE + "?text=" + encodeURIComponent(message);

            setHint("Открываем WhatsApp — подтвердите отправку сообщения…", "success");

            var win = window.open(url, "_blank");
            // если поп-ап заблокирован — переходим в текущем окне
            if (!win) {
                window.location.href = url;
            }
        });
    }
})();
