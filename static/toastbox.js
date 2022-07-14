function tweetSuccess() {
    const toastShow = document.getElementById('tweetSuccess')
        const toast = new bootstrap.Toast(toastShow, {delay: 3500});
        toast.show();           
}

function tweetFail() {
const toastShow = document.getElementById('tweetFail')
    const toast = new bootstrap.Toast(toastShow, {delay: 3500});
    toast.show();           
}

function scheduleTweetSuccess() {
    const toastShow = document.getElementById('scheduleSuccess')
        const toast = new bootstrap.Toast(toastShow, {delay: 3500});
        toast.show();           
}

function scheduleTweetFail() {
const toastShow = document.getElementById('scheduleFail')
    const toast = new bootstrap.Toast(toastShow, {delay: 3500});
    toast.show();           
}