# Chart Test Prompts and Datasets

This document contains test prompts and datasets for all 15 chart types.
Each section includes:

- English prompt
- Turkish prompt
- CSV dataset
- JSON dataset

---

## 📊 Pie Chart

**[EN] Prompt:**
Show customer distribution by region as a pie chart.

**[TR] İstem:**
Müşteri dağılımını bölgelere göre pasta grafikte göster.

**CSV**

```csv
Region,CustomerCount
North,120
South,95
East,140
West,110
Central,80
```

**JSON**

```json
[
  { "Region": "North", "CustomerCount": 120 },
  { "Region": "South", "CustomerCount": 95 },
  { "Region": "East", "CustomerCount": 140 },
  { "Region": "West", "CustomerCount": 110 },
  { "Region": "Central", "CustomerCount": 80 }
]
```

---

## 🍩 Donut Chart

**[EN] Prompt:**
Show market share by product category as a donut chart.

**[TR] İstem:**
Ürün kategorilerine göre pazar payını donut grafikte göster.

**CSV**

```csv
Category,MarketShare
Electronics,35
Clothing,22
Home,18
Sports,15
Books,10
```

**JSON**

```json
[
  { "Category": "Electronics", "MarketShare": 35 },
  { "Category": "Clothing", "MarketShare": 22 },
  { "Category": "Home", "MarketShare": 18 },
  { "Category": "Sports", "MarketShare": 15 },
  { "Category": "Books", "MarketShare": 10 }
]
```

---

## 📈 Bar Chart

**[EN] Prompt:**
Show total sales by city as a bar chart.

**[TR] İstem:**
Şehirlere göre toplam satışları çubuk grafikte göster.

**CSV**

```csv
City,Sales
Istanbul,52000
Ankara,41000
Izmir,37000
Bursa,29000
Antalya,25000
```

**JSON**

```json
[
  { "City": "Istanbul", "Sales": 52000 },
  { "City": "Ankara", "Sales": 41000 },
  { "City": "Izmir", "Sales": 37000 },
  { "City": "Bursa", "Sales": 29000 },
  { "City": "Antalya", "Sales": 25000 }
]
```

---

## 📉 Line Chart

**[EN] Prompt:**
Show monthly website visits trend as a line chart.

**[TR] İstem:**
Aylık web sitesi ziyaret trendini çizgi grafikte göster.

**CSV**

```csv
Month,Visits
Jan,12000
Feb,13500
Mar,14200
Apr,15800
May,17100
Jun,16500
Jul,18200
Aug,19400
Sep,18800
Oct,20100
Nov,21500
Dec,22900
```

**JSON**

```json
[
  { "Month": "Jan", "Visits": 12000 },
  { "Month": "Feb", "Visits": 13500 },
  { "Month": "Mar", "Visits": 14200 },
  { "Month": "Apr", "Visits": 15800 },
  { "Month": "May", "Visits": 17100 },
  { "Month": "Jun", "Visits": 16500 },
  { "Month": "Jul", "Visits": 18200 },
  { "Month": "Aug", "Visits": 19400 },
  { "Month": "Sep", "Visits": 18800 },
  { "Month": "Oct", "Visits": 20100 },
  { "Month": "Nov", "Visits": 21500 },
  { "Month": "Dec", "Visits": 22900 }
]
```

---

## 🌊 Area Chart

**[EN] Prompt:**
Show monthly energy consumption as an area chart.

**[TR] İstem:**
Aylık enerji tüketimini alan grafikte göster.

**CSV**

```csv
Month,Consumption
Jan,320
Feb,340
Mar,360
Apr,390
May,420
Jun,460
Jul,510
Aug,495
Sep,450
Oct,410
Nov,370
Dec,340
```

**JSON**

```json
[
  { "Month": "Jan", "Consumption": 320 },
  { "Month": "Feb", "Consumption": 340 },
  { "Month": "Mar", "Consumption": 360 },
  { "Month": "Apr", "Consumption": 390 },
  { "Month": "May", "Consumption": 420 },
  { "Month": "Jun", "Consumption": 460 },
  { "Month": "Jul", "Consumption": 510 },
  { "Month": "Aug", "Consumption": 495 },
  { "Month": "Sep", "Consumption": 450 },
  { "Month": "Oct", "Consumption": 410 },
  { "Month": "Nov", "Consumption": 370 },
  { "Month": "Dec", "Consumption": 340 }
]
```

---

## 🧱 Stacked Bar Chart

**[EN] Prompt:**
Compare quarterly revenue components by product line as a stacked bar chart.

**[TR] İstem:**
Çeyreklere göre ürün hatlarının gelir bileşenlerini yığılmış çubuk grafikte karşılaştır.

**CSV**

```csv
Quarter,ProductA,ProductB,ProductC
Q1,18000,14000,9000
Q2,21000,16000,11000
Q3,24000,17000,12000
Q4,26000,19000,15000
```

**JSON**

```json
[
  { "Quarter": "Q1", "ProductA": 18000, "ProductB": 14000, "ProductC": 9000 },
  { "Quarter": "Q2", "ProductA": 21000, "ProductB": 16000, "ProductC": 11000 },
  { "Quarter": "Q3", "ProductA": 24000, "ProductB": 17000, "ProductC": 12000 },
  { "Quarter": "Q4", "ProductA": 26000, "ProductB": 19000, "ProductC": 15000 }
]
```

---

## ✨ Scatter Chart

**[EN] Prompt:**
Show the relationship between experience and salary as a scatter chart.

**[TR] İstem:**
Deneyim ve maaş arasındaki ilişkiyi saçılım grafiğinde göster.

**CSV**

```csv
Employee,Experience,Salary
Ali,1,22000
Ayse,2,25000
Can,3,28000
Deniz,4,32000
Ece,5,36000
Firat,6,41000
Gizem,7,45000
Hakan,8,49000
Irmak,9,53000
Kemal,10,57000
```

**JSON**

```json
[
  { "Employee": "Ali", "Experience": 1, "Salary": 22000 },
  { "Employee": "Ayse", "Experience": 2, "Salary": 25000 },
  { "Employee": "Can", "Experience": 3, "Salary": 28000 },
  { "Employee": "Deniz", "Experience": 4, "Salary": 32000 },
  { "Employee": "Ece", "Experience": 5, "Salary": 36000 },
  { "Employee": "Firat", "Experience": 6, "Salary": 41000 },
  { "Employee": "Gizem", "Experience": 7, "Salary": 45000 },
  { "Employee": "Hakan", "Experience": 8, "Salary": 49000 },
  { "Employee": "Irmak", "Experience": 9, "Salary": 53000 },
  { "Employee": "Kemal", "Experience": 10, "Salary": 57000 }
]
```

---

## 🧾 Table Chart

**[EN] Prompt:**
Show employee performance records in a table.

**[TR] İstem:**
Çalışan performans kayıtlarını tablo olarak göster.

**CSV**

```csv
Employee,Department,Score,Projects
Alice,Engineering,88,5
Bob,Marketing,74,3
Charlie,Engineering,92,6
Diana,Sales,81,4
Eve,Finance,86,4
```

**JSON**

```json
[
  {
    "Employee": "Alice",
    "Department": "Engineering",
    "Score": 88,
    "Projects": 5
  },
  { "Employee": "Bob", "Department": "Marketing", "Score": 74, "Projects": 3 },
  {
    "Employee": "Charlie",
    "Department": "Engineering",
    "Score": 92,
    "Projects": 6
  },
  { "Employee": "Diana", "Department": "Sales", "Score": 81, "Projects": 4 },
  { "Employee": "Eve", "Department": "Finance", "Score": 86, "Projects": 4 }
]
```

---

## 🔥 Heatmap Chart

**[EN] Prompt:**
Show sales intensity by region and category as a heatmap.

**[TR] İstem:**
Bölge ve kategoriye göre satış yoğunluğunu ısı haritasında göster.

**CSV**

```csv
Region,Category,Sales
North,Electronics,420
North,Clothing,310
North,Home,260
South,Electronics,390
South,Clothing,280
South,Home,240
East,Electronics,510
East,Clothing,360
East,Home,300
West,Electronics,460
West,Clothing,330
West,Home,290
```

**JSON**

```json
[
  { "Region": "North", "Category": "Electronics", "Sales": 420 },
  { "Region": "North", "Category": "Clothing", "Sales": 310 },
  { "Region": "North", "Category": "Home", "Sales": 260 },
  { "Region": "South", "Category": "Electronics", "Sales": 390 },
  { "Region": "South", "Category": "Clothing", "Sales": 280 },
  { "Region": "South", "Category": "Home", "Sales": 240 },
  { "Region": "East", "Category": "Electronics", "Sales": 510 },
  { "Region": "East", "Category": "Clothing", "Sales": 360 },
  { "Region": "East", "Category": "Home", "Sales": 300 },
  { "Region": "West", "Category": "Electronics", "Sales": 460 },
  { "Region": "West", "Category": "Clothing", "Sales": 330 },
  { "Region": "West", "Category": "Home", "Sales": 290 }
]
```

---

## 🕸️ Radar Chart

**[EN] Prompt:**
Compare employee skill profiles with a radar chart using Performance, Teamwork, Communication, and Leadership.

**[TR] İstem:**
Çalışan yetkinlik profillerini Performance, Teamwork, Communication ve Leadership metrikleriyle radar grafikte karşılaştır.

**CSV**

```csv
Employee,Performance,Teamwork,Communication,Leadership
Alice,8,7,9,6
Bob,6,9,7,8
Charlie,9,6,8,7
Diana,7,8,6,9
```

**JSON**

```json
[
  {
    "Employee": "Alice",
    "Performance": 8,
    "Teamwork": 7,
    "Communication": 9,
    "Leadership": 6
  },
  {
    "Employee": "Bob",
    "Performance": 6,
    "Teamwork": 9,
    "Communication": 7,
    "Leadership": 8
  },
  {
    "Employee": "Charlie",
    "Performance": 9,
    "Teamwork": 6,
    "Communication": 8,
    "Leadership": 7
  },
  {
    "Employee": "Diana",
    "Performance": 7,
    "Teamwork": 8,
    "Communication": 6,
    "Leadership": 9
  }
]
```

---

## 🌳 Treemap Chart

**[EN] Prompt:**
Show market share by company as a treemap.

**[TR] İstem:**
Şirketlere göre pazar payını treemap grafikte göster.

**CSV**

```csv
Company,MarketShare
Alpha,28
Beta,22
Gamma,18
Delta,14
Epsilon,10
Zeta,8
```

**JSON**

```json
[
  { "Company": "Alpha", "MarketShare": 28 },
  { "Company": "Beta", "MarketShare": 22 },
  { "Company": "Gamma", "MarketShare": 18 },
  { "Company": "Delta", "MarketShare": 14 },
  { "Company": "Epsilon", "MarketShare": 10 },
  { "Company": "Zeta", "MarketShare": 8 }
]
```

---

## 📊 Histogram

**[EN] Prompt:**
Show distribution of ages.

**[TR] İstem:**
Yaşların dağılımını göster.

**CSV**

```csv
Name,Age
Alice,23
Bob,34
Charlie,28
Diana,45
Eve,31
Frank,27
Grace,52
Henry,38
Iris,29
Jack,41
Kate,25
Leo,33
Mia,47
Noah,22
Olivia,36
```

**JSON**

```json
[
  { "Name": "Alice", "Age": 23 },
  { "Name": "Bob", "Age": 34 },
  { "Name": "Charlie", "Age": 28 },
  { "Name": "Diana", "Age": 45 },
  { "Name": "Eve", "Age": 31 },
  { "Name": "Frank", "Age": 27 },
  { "Name": "Grace", "Age": 52 },
  { "Name": "Henry", "Age": 38 },
  { "Name": "Iris", "Age": 29 },
  { "Name": "Jack", "Age": 41 },
  { "Name": "Kate", "Age": 25 },
  { "Name": "Leo", "Age": 33 },
  { "Name": "Mia", "Age": 47 },
  { "Name": "Noah", "Age": 22 },
  { "Name": "Olivia", "Age": 36 }
]
```

---

## 📦 BoxPlot

**[EN] Prompt:**
Show salary distribution by department as a boxplot.

**[TR] İstem:**
Departmanlara göre maaş dağılımını boxplot olarak göster.

**CSV**

```csv
Department,Salary
Engineering,52000
Engineering,55000
Engineering,60000
Engineering,62000
Engineering,65000
Marketing,38000
Marketing,42000
Marketing,45000
Marketing,47000
Marketing,50000
Sales,34000
Sales,36000
Sales,39000
Sales,41000
Sales,44000
```

**JSON**

```json
[
  { "Department": "Engineering", "Salary": 52000 },
  { "Department": "Engineering", "Salary": 55000 },
  { "Department": "Engineering", "Salary": 60000 },
  { "Department": "Engineering", "Salary": 62000 },
  { "Department": "Engineering", "Salary": 65000 },
  { "Department": "Marketing", "Salary": 38000 },
  { "Department": "Marketing", "Salary": 42000 },
  { "Department": "Marketing", "Salary": 45000 },
  { "Department": "Marketing", "Salary": 47000 },
  { "Department": "Marketing", "Salary": 50000 },
  { "Department": "Sales", "Salary": 34000 },
  { "Department": "Sales", "Salary": 36000 },
  { "Department": "Sales", "Salary": 39000 },
  { "Department": "Sales", "Salary": 41000 },
  { "Department": "Sales", "Salary": 44000 }
]
```

---

## 🫧 Bubble Chart

**[EN] Prompt:**
Show experience vs salary with bubble size based on performance score.

**[TR] İstem:**
Deneyim ve maaşı, balon boyutu performans skoruna göre olacak şekilde göster.

**CSV**

```csv
Employee,Experience,Salary,PerformanceScore
Alice,2,28000,62
Bob,4,36000,74
Charlie,6,44000,81
Diana,8,52000,88
Eve,3,31000,69
Frank,5,40000,77
Grace,7,48000,85
Henry,9,56000,91
```

**JSON**

```json
[
  {
    "Employee": "Alice",
    "Experience": 2,
    "Salary": 28000,
    "PerformanceScore": 62
  },
  {
    "Employee": "Bob",
    "Experience": 4,
    "Salary": 36000,
    "PerformanceScore": 74
  },
  {
    "Employee": "Charlie",
    "Experience": 6,
    "Salary": 44000,
    "PerformanceScore": 81
  },
  {
    "Employee": "Diana",
    "Experience": 8,
    "Salary": 52000,
    "PerformanceScore": 88
  },
  {
    "Employee": "Eve",
    "Experience": 3,
    "Salary": 31000,
    "PerformanceScore": 69
  },
  {
    "Employee": "Frank",
    "Experience": 5,
    "Salary": 40000,
    "PerformanceScore": 77
  },
  {
    "Employee": "Grace",
    "Experience": 7,
    "Salary": 48000,
    "PerformanceScore": 85
  },
  {
    "Employee": "Henry",
    "Experience": 9,
    "Salary": 56000,
    "PerformanceScore": 91
  }
]
```

---

## 🔻 Funnel Chart

**[EN] Prompt:**
Show the sales conversion funnel from visitors to purchases.

**[TR] İstem:**
Ziyaretçiden satın almaya kadar satış dönüşüm hunisini göster.

**CSV**

```csv
Stage,Count
Visitors,10000
Leads,4200
QualifiedLeads,2100
Proposals,980
Negotiations,520
Purchases,260
```

**JSON**

```json
[
  { "Stage": "Visitors", "Count": 10000 },
  { "Stage": "Leads", "Count": 4200 },
  { "Stage": "QualifiedLeads", "Count": 2100 },
  { "Stage": "Proposals", "Count": 980 },
  { "Stage": "Negotiations", "Count": 520 },
  { "Stage": "Purchases", "Count": 260 }
]
```
