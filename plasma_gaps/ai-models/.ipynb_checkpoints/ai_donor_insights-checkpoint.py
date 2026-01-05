from dotenv import load_dotenv
import os

# Load environment variables from parent directory's .env file
load_dotenv(dotenv_path='../.env')  # 👈 This is key!

# Now access Supabase credentials from .env
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")  # or SERVICE_ROLE_KEY

print("Supabase URL:", SUPABASE_URL[:30] + "...")
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# 🧠 Donor Insights: AI Starter Notebook\n",
    "\n",
    "**Goal:** Cluster donors and predict elasticity using real or sample data.\n",
    "\n",
    "- Clustering with KMeans\n",
    "- Elasticity prediction with Random Forest\n",
    "- Visualization of results"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 📦 Imports\n",
    "import pandas as pd\n",
    "import numpy as np\n",
    "from sklearn.cluster import KMeans\n",
    "from sklearn.preprocessing import StandardScaler, LabelEncoder\n",
    "from sklearn.model_selection import train_test_split\n",
    "from sklearn.ensemble import RandomForestClassifier\n",
    "from sklearn.metrics import classification_report, confusion_matrix\n",
    "import matplotlib.pyplot as plt\n",
    "import seaborn as sns"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# 🔹 Step 1: Simulate Sample Donor Data (replace this with your real CSV)"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Create synthetic donor dataset:\n",
    "\n",
    "# Columns: [donation_frequency, avg_donation_amount, channel_score, age]\n",
    "\n",
    "# Optional: Add 'elastic' label based on rule logic (> threshold)\n", 
     "\n", 
     "# This simulates basic donor behavior vectors.\n", 
     "\n", 
     "\n", 
     "\n", 
     "%matplotlib inline\n", 
     "\n", 
     "# Generate synthetic data\n", 
     "\n", 
     np.random.seed(42)\n", 
     n = 300 \n", 

"df = pd.DataFrame({\n", 
"    'donation_frequency': np.random.poisson(5, n),\n", 

"    'avg_donation_amount': np.random.normal(60, 20, n).clip(10),\n",

"    'channel_score': np.random.randint(0,10,n),\n",

"    'age': np.random.normal(40,12,n).astype(int)\n",

"})\n",

"# Define ground truth label (optional for model training)\ndf['elastic'] = ((df['donation_frequency'] * df['avg_donation_amount']) > 300).astype(int)\ndf.head()"
]
},
{
"cell_type":"markdown","metadata":{"tags":["text"]},"source":["# 🔹 Step 2: KMeans Clustering"]
},
{"cell_type":"code","execution_count":
null,"metadata":
{},"outputs":[],"source":[

"# Normalize features for clustering        \nx_features = df[['donation_frequency','avg_donation_amount','channel_score','age']]\nx_scaled = StandardScaler().fit_transform(x_features)\nkmeans = KMeans(n_clusters=3, random_state=42)            \ndf['cluster'] = kmeans.fit_predict(x_scaled)\ndf['cluster'].value_counts()"
]},
{"cell_type":"markdown","metadata":
{},"source":["# 🔹 Step 3: Visualize Clusters"]},

{"cell_type":"code","execution_count":
null,"metadata":
{},"outputs":[],"source":[

"sns.scatterplot(\ndata=df,\nx='donation_frequency',\ny='avg_donation_amount',\nhue='cluster',palette='Set2'\")\plt.title(\"Donor Clusters\")"]

},

{"cell_type":"markdown","metadata":{"tags":["text"]},"source":["# 🔹 Step 4: Train Elasticity Prediction Model"]
},
{"cell_type":"code","execution_count":
null,"metadata":
{},"outputs":[],"source":[

"x = df[['donation_frequency','avg_donation_amount','channel_score','age']]\ny = df['elastic']\nx_train,x_test,y_train,y_test=train_test_split(x,y,test_size=0.25,random_state=1)\nrfc=RandomForestClassifier(n_estimators=100,max_depth=4,class_weight=\"balanced\")\nrfc.fit(x_train,y_train)\ny_pred=rfc.predict(x_test)"

]},
{"cell_type":"code","execution_count":
null,"metadata":{
},"outputs":[],

"source":["print(confusion_matrix(y_test,y_pred))\nprintf(classification_report(y_test,y_pred))"]

},

{"cell_type":"markdown","metadata":{"tags":["text"]},"source":["# 🎉 Summary:\n","\u2714\uFE0F We clustered donors into segments using unsupervised learning (KMeans).\u000a\u2714\uFE0F We trained a supervised ML model to predict whether a donor is elastic.\u000a\u2714\uFE0F You can now plug this logic into your dashboard/exports/backend."]
}

],
"metadata":{
"kernelspec":{
"display_name":"Python 3","language":"python","name":"python3"},
"language_info":{"name":"python"}
},
"nbformat":
4,
"nbformat_minor":

2
}