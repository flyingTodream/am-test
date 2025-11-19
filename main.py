import os
import shutil
import subprocess

def m3u8_to_mp4(m3u8_url, output_path="output.mp4"):
    """
    下载m3u8并合并成mp4
    :param m3u8_url: m3u8文件URL或本地路径
    :param output_path: 输出mp4文件路径
    """
    # 检查是否安装ffmpeg
    if not shutil.which("ffmpeg"):
        raise RuntimeError("未找到 ffmpeg，请先安装: https://ffmpeg.org/download.html")

    # 调用ffmpeg下载并转换
    cmd = [
        "ffmpeg", "-y",
        "-i", m3u8_url,
        "-c", "copy",
        "-bsf:a", "aac_adtstoasc",
        output_path
    ]

    subprocess.run(cmd, check=True)
    print(f"✅ 下载完成: {output_path}")

m3u8_to_mp4("https://hls.cntv.lxdns.com/asp/hls/main/0303000a/3/default/40507916d6014f599b54d9c88662f0bf/main.m3u8?maxbr=2048", "第7集.mp4")
