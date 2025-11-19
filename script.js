document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('jaiodjawiudjawdoaj-form');
    const input = document.getElementById('jaiodjawiudjawdoaj-input');
    const submitBtn = document.getElementById('jaiodjawiudjawdoaj-submit-btn');
    const loadingDiv = document.getElementById('jaiodjawiudjawdoaj-loading');
    const optionsDiv = document.getElementById('jaiodjawiudjawdoaj-options');
    const mp4Btn = document.getElementById('jaiodjawiudjawdoaj-mp4-btn');
    const mp3Btn = document.getElementById('jaiodjawiudjawdoaj-mp3-btn');

    let videoId = null;
    let videoDetails = null;
    
    const corsProxy
