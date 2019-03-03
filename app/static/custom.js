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
        el.attr("user_role", "1");

    } else if(el.hasClass('role-1')){
        el.toggleClass('role-1');
        el.toggleClass('role-0');
        el.attr("user_role", "0");
    }
}

function owlChanged() {
    let month = window.location.hash.substring(1);
    $('#download-xlsx').attr('href', '/get_xlsx/'+month);

    $.get('/get_activities/'+month, (data) => {
        console.log(data);
    })
}


$(() => {
    $(".spoiler").spoiler();

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

    $('.users button').click((e) => {
        let el = $(e.target);
        console.log(el);
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

    $('#download-xlsx').click((e) => {
        let link = $(e.target);
        console.log(link)
    });

    $('#save-roles').click(() => {
        let roles = [];
        $('.users button').each(function () {
            let userRole = {"_pk": $(this).attr("pk"), "role": $(this).attr("user_role")};
            roles.push(userRole);
        });


        $.ajax({
            url: '/save_roles',
            type: 'post',
            data: JSON.stringify(roles),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                $('span.status').text(data.msg);
                setTimeout(function(){
                    $('span.status').text("");
                }, 3000);

                console.log(data);
            }
        })
    })
});