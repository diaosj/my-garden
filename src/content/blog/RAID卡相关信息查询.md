---
title: RAID卡相关信息查询
date: 2016-01-22 17:01:28
description: "Archived from my original Hexo blog."
tags: ["MySQL", "Linux"]
---
查看电量百分比：

```bash
megacli -AdpBbuCmd -GetBbuStatus -aALL | grep "Relative State of Charge"
```

查看充电状态：

```bash
megacli -AdpBbuCmd -GetBbuStatus -aALL | grep "Charger Status"
```

查看缓存策略：

```bash
megacli -LDGetProp -Cache -LALL -a0
```