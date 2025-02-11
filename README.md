# M3U8 Proxy Server

Welcome to the M3U8 Proxy Server! Tired of dealing with those pesky CORS errors when trying to stream your M3U8 files? Fear not, because our proxy server is here to save the day!

## 🎯 What This Project Does

This Node.js application acts as a middleman between your requests and the M3U8 files you're trying to access. Just drop your M3U8 link into the input box, and we'll take care of the rest. Our server proxies the M3U8 file and provides you with a new link to use—free from CORS troubles.

## Deployment

### Vercel

Host your own instance of M3U8-Proxy on vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/itzzzme/m3u8proxy)
### Render

Host your own instance of M3U8-Proxy on Render.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/itzzzme/m3u8proxy)

### Cloudflare-worker
 - Create an example starter worker in your cloudflare account
 - Edit the code of the worker after deploying it
 - Override the code of your starter worker with the code given in `m3u8proxy(cf_worker).js`
 - Deploy your worker

## 🚀 How It Works

1. **Enter Your M3U8 Link**: Simply input your M3U8 URL into the provided input box.
2. **Get a Proxied Link**: Our server fetches the M3U8 file and proxies it for you.
3. **Use the Proxied Link**: Replace your original link with the new proxied link in your platform.

## <span>⚙️ Envs</span>

More info can be found in [`.env.example`](https://github.com/itzzzme/m3u8proxy/blob/main/.env.example) file

- `HOST`: host of your proxy server `optional`
- `PORT`: port number (any) `optional`
- `PUBLIC_URL`: link of your website  `mandatory`
- `ALLOWED_ORIGINS`: origins you want to allow  `mandatory`


## 🕵️‍♂️ How to Use

If you want to use the proxy directly, append your M3U8 link to the following URL:

[https://<deployed_web_server>/m3u8-proxy?url={url}](https://<deployed_web_server>/m3u8-proxy?url={url})

For example, if your M3U8 link is `https://example.com/stream.m3u8`, you would use:

[https://<deployed_web_server>/m3u8-proxy?url=https://example.com/stream.m3u8](https://<deployed_web_server>/m3u8-proxy?url=https://example.com/stream.m3u8)

## 🎥 Video Demo

You can watch a demo of the proxy server in action using the MP4 video file below:

https://github.com/user-attachments/assets/ae8e74a6-176d-42a4-8590-3b7a2b7182ff



## 📹 Example Code Snippet

Here’s how you can use Video.js to play the proxied URL:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proxied M3U8 Player</title>
    <link href="https://vjs.zencdn.net/7.21.0/video-js.css" rel="stylesheet">
</head>
<body>
    <div class="video-container">
        <video id="my-video" class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto" width="640" height="360">
            <source src="PROXIED_M3U8_URL_HERE" type="application/x-mpegURL">
        </video>
    </div>

    <script src="https://vjs.zencdn.net/7.21.0/video.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/videojs-contrib-hls@latest"></script>
    <script>
        var player = videojs('my-video');
    </script>
</body>
</html>

```

## 😂 A Note About CORS

CORS, oh CORS—you're like that friend who always shows up uninvited. But don’t worry, our proxy server is the bouncer that keeps you and your streams happy and stress-free. No more unwanted guests in the form of CORS errors!

## 📜 License

This project is licensed under the MIT License. 

## 🤝 Contributing

Feel free to open issues or pull requests if you have suggestions or improvements!

<br/>

<p align="center" style="text-decoration: none;">Made by <a href="https://github.com/itzzzme" target="_blank">itzzzme 
</a>🫰</p>

