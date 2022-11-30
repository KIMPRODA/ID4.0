var users = [];
var token;

function getData(callback) {
    chrome.storage.local.get(["users"], function (result) {        
        
        this.users = !result.users ? [] : JSON.parse(result.users);            
        
        generate();
    });
}

function generate() {
    $("#ul_users").empty();
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        var text = user.HNAME + ' / ' + user.DEPTNM;
        var $li = $("<li></li>").text(text).data(user).append('<span><button class="del"><i class="fa fa-times" aria-hidden="true"></i></button></span>');
        $("#ul_users").append($li);
    }
}

async function setToken() {
    token = await getToken();
}

$(document).ready(function () {
    getData();
    setToken();

    $("#ul_users").on("click", ".del", function (e) {        
        e.stopPropagation();
        
        var data = $(this).parents("li").data();
        console.log(data);
        var index = users.findIndex((item) => item.EMPNO == data.EMPNO);
        if(index >-1) {
            users.splice(index, 1);
        }
                
        updateList();
    });

    $("#ul_users").on("click", "li", function () {
        var data = $(this).data();

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentUrl = tabs[0].url;

            if (currentUrl.indexOf("login") > -1) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: applyLogin,
                    args: [data.EMAIL, data.EMPNO],
                });
                window.close();
            } else {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: logout,
                });
                setTimeout(function () {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: applyLogin,
                        args: [data.EMAIL, data.EMPNO, currentUrl],
                    });
                    window.close();
                }, 1000);
            }
        });
    });

    $("#ipt_username").on("keyup", function (e) {
        if (e.keyCode == 13) {
            addUser($(this)[0].value);
            $(this)[0].value = '';
        }
    });

    $("#btn_add").on("click", function () {
        addUser($("#ipt_username")[0].value);
        $("#ipt_username")[0].value = '';
    });

    $("#btn_remove").on("click", function () {
        clear();
    });
});

// function addUser(username) {
//     var data = {
//         empno: "216218",
//         email: "sjbaek@ildong.com",
//         name: "백승재" + (users.length + 1),
//     };
//     users.push(data);
//     chrome.storage.local.set({ users: JSON.stringify(users) });
//     getData();
// }

function logout() {
    document.getElementsByClassName("logout")[0].click();
}

function applyLogin(username, password, curl) {
    if (window.location.href.indexOf("login") > -1) {
        if (curl) {
            document.getElementsByName("back_url")[0].value = curl;
        }
        document.getElementById("username").value = username;
        document.getElementById("password").value = password;
        document.getElementById("login-submit").click();
    }
}

function clear() {    
    users = [];
    updateList();
}

async function addUser(username) {    
    console.log(username);
    if(!token){
        token = await getToken();
    }
    var temps = await getUsers(token, username);
        
    for (var i = 0 ; i < temps.length ; i++) {
        var temp =  temps[i];
        var index = users.findIndex((item) => item.EMPNO == temp.EMPNO);
        if(index == -1){
            users.push(temp);
        }
    }    
    updateList();
}

function updateList() {
    chrome.storage.local.set({ users: JSON.stringify(users) });
    getData();
}

function getToken() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'http://172.16.17.199:8081/api/v1/login/',
            type: "post",
            contentType: "application/json; charset=utf-8",
            accept: "application/json",
            dataType: "json",
            data: JSON.stringify({ params: { userId: '', userPw: '', empno: "fQ0QQ11Z0Q16Q1O1" } }),
            error: reject,
            success: (r) => {
                resolve(r.token);
            }
        });
    });
}

function getUsers(token, username) {
    console.log(token, username);
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://data.ildong.com/api/v1/GetDetailItem2/475',
            type: "post",
            accept: "application/json",
            dataType: "json",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*",
                "Access-Contorl-Allow-Credencial": true,
                Authorization: token
            },
            data: JSON.stringify({ params: { hname: username } }),
            error: reject,
            success: (r) => {
                resolve(r.data);
            }
        });
    });
}