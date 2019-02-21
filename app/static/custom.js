const MEMBER = 0;
const MODERATOR = 1;
const ADMIN = 2;


const COLORS = {
    MEMBER: "#002642",
    MODERATOR: "#5b3f00",
    ADMIN: "#840032",
};

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

$(() => {
    $('.users button').click((e) => {
        let el = $(e.target);
        console.log(el);
        getRole(el);
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