# View 设置

### 平滑slide动画
就是 Autoplay`Enable`模式下的slide 和 `Mine Slide 自动推进`开启时的mine slide 的箭头是一坨一坨消失（按判定区）还是一个一个地消失（按箭头）。

### Auto 模式
名称 | 描述
--- | ---
Enable | 所有note都是大p，程序写死的必须大p
DJAuto (Btn) | 模拟游玩，可能莫名其妙出现小p，也具有完整无理检查功能
DJAuto | 模拟游玩，同上，只是内屏玩家，不打外键
Random | 表现和Enable相似，只是判定随心配
Disable | 模拟游玩

模拟游玩类型的都可以用鼠标（触摸）即WEDCXZAQ（外键）来操作。

DJAuto目前的代码已经可以检查到外键无理，对于touch group也能判断最佳手法，对于大尺寸touch甚至全屏touch，它会用扫的方式来完成，除此之外，重叠slide与路径上touch的触点合并等等，越来越多拟人化的feat已经实现或正在开发中！

### 展示AutoPlay的手
若开启，触摸事件会使用红色圆形表示，touch计算出来的覆盖圆会使用浅绿色圆形表示，触发的判定区会使用青色圆形表示。

### 导出视频帧率
模拟游玩的Autoplay模式请不要设置到60fps以下，不然会影响判定。

### 导出质量
| 编码器 | 码控模式 | Low (0) | Medium (1) | High (2) | Ultra (3) |
|---|---|---|---|---|---|
| libx264   | CRF   | 28 | 23 | 18 | 14 |
| h264_nvenc | CQ    | 30 | 24 | 18 | 14 |
| h264_qsv  | ICQ   | 32 | 25 | 18 | 14 |
| h264_amf  | QVBR  | 30 | 24 | 18 | 14 |
| h264_mf   | 码率 (Mbps @1080p60) | 4 | 8 | 16 | 32 |

### UI皮肤
切换到TrgUI来使用由TRG设计的侧面统计UI！

### 全局音频延迟
只影响预览模式下的track延迟，因为加载模式的差异，SFX的延迟够用，而track的延迟比较大，于我来说，`0.03`是正好的，不同机器表现有一定区别。

### 使用旧的星星图层顺序
新的：新的slide会出现在旧的slide下方
旧的：新的slide会出现在旧的slide上方

### Mine Slide 自动推进
mine slide现在公认为有滚木帮你完成，如果你抢在滚木之前完成了，slide就会判定为miss，这就是Mine Slide 自动推进。Autoplay`Enable`不受影响。
