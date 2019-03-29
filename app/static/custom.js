MONTH_NUMBERS = {"january": 0, "february":1, "march": 2,
                 "april": 3, "may": 4, "june": 5, "july": 6,
                 "august": 7, "september": 8, "october": 9,
                 "november": 10, "december": 11};

MONTH_NAMES = ["january", "february", "march", "april", "may",
               "june", "july", "august", "september", "october",
               "november", "december"];

function getRole(el){
    if(el.hasClass('role-0')){
        el.toggleClass('role-0');
        el.toggleClass('role-1');
        el.attr("data-role", "1");

    } else if(el.hasClass('role-1')){
        el.toggleClass('role-1');
        el.toggleClass('role-0');
        el.attr("data-role", "0");
    }
}

function owlChanged() {
    let month = window.location.hash.substring(1);
    $('#download-xlsx').attr('href', '/get_xlsx/'+month);
    let activities = $('.activities');

    $.get('/get_activities/'+month, (data) => {
        activities.html(data);
        let spoilers = $(".spoiler");
        spoilers.spoiler({triggerEvents: true, contentClass: 'spoiler-content-wrapper'});

        spoilers.on("jq-spoiler-visible", function(e) {
            console.log($(e.target).find('.fa-angle-down').toggleClass('fa-angle-down fa-angle-up'));
        });


        spoilers.on("jq-spoiler-hidden", function(e) {
            console.log($(e.target).find('.fa-angle-up').toggleClass('fa-angle-up fa-angle-down'));
        });

        $('.fa-trash-alt').click(function (e) {
            e.stopPropagation();

            let activityId = $(e.target).parent().parent().parent().attr('data-spoiler-link');
            console.log(activityId);

            if(confirm('Ви точно хочете видалити цей запис?')){
                $.get('/delete_activity/' + activityId, (data) => {
                    alert(data.message);
                    // owl.trigger('change.owl.carousel')
                    location.reload()
                });
            }
        })

    })
}

function setStatus(msg) {
    $('.status span').text(msg);
    setTimeout(function(){
        $('.status span').text("");
    }, 3000);
}

function clearFlashed(){
    setTimeout(function(){
        $('.status p').text("");
    }, 3000)
}


$(() => {
    clearFlashed();
    let owl = $('.owl-carousel');

    owl.owlCarousel({
        center: true,
        items: 3,
        loop:true,
        margin:10,
        nav: true,
        URLhashListener:true,
        onChanged: owlChanged,

    });

    function goToCurrentMonth(){
        let position = MONTH_NUMBERS[window.location.hash.substring(1)];
        owl.trigger('to.owl.carousel', [position, 1000]);
    }

    owl.on('mousewheel', '.owl-stage', function (e) {
        if (e.deltaY>0) {
            owl.trigger('next.owl');
        } else {
            owl.trigger('prev.owl');
        }
        e.preventDefault();
    });

    $('.user').click((e) => {
        let el = $(e.target);
        if (!el.hasClass('user')){
            el = el.parent();
        }
        getRole(el);
    });


    if (window.location.pathname === '/stats'){
        let month_name = window.location.hash.substring(1);
        if (month_name){
            goToCurrentMonth();
        } else {
            let date = new Date();
            window.location.hash = MONTH_NAMES[date.getMonth()];
            goToCurrentMonth();
        }
    }

//    $('#qrcode img').fancybox();

    $('.get-qrcode').click((e) => {
        let userId = $(e.target).parent().parent().parent().attr('data-pk');
        console.log(userId);
        $.get('/get_qr/' + userId, function (data) {
            console.log(data);

            $.fancybox.open({
                src: 'data:image/png;base64, '+data.qrcode,
                opts: {
                    caption: data.name + '<br><b>Код: </b>' + data.code
                }
            });

        });
    });

    $('.delete-user').click((e) => {
        let userId = $(e.target).parent().parent().parent().attr('data-pk');
        console.log(userId);
        if (confirm('Точно видалити члена?')){
            $.get('/delete_user/' + userId, function (data) {
                setStatus(data.msg);
                console.log(data)
                if (data.success){
                    location.reload()
                }

            });
        }
    });

    $('#download-xlsx').click((e) => {
        let link = $(e.target);
        console.log(link)
    });

    $('#save-roles').click(() => {
        let roles = [];
        $('.user').each(function () {
            let userRole = {"_pk": $(this).attr("data-pk"), "role": $(this).attr("data-role")};
            roles.push(userRole);
        });


        $.ajax({
            url: '/save_roles',
            type: 'post',
            data: JSON.stringify(roles),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                setStatus(data.msg)
            }
        })
    })
});