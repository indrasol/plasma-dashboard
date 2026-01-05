import pandas as pd
import numpy as np
import random
import string
from datetime import datetime
import os

# === Step 1: Curated Interest Category/Name Pairs === #
INTEREST_LIST = [
    ("Travel and Exploration", "Visiting new countries and cultures"),
    ("Travel and Exploration", "Backpacking and adventure travel"),
    ("Travel and Exploration", "Road trips and exploring scenic routes"),
    ("Travel and Exploration", "Urban exploration and historical tours"),
    ("Travel and Exploration", "Ecotourism and sustainable travel"),
    ("Travel and Exploration", "Cruise vacations and sailing adventures"),

    ("Reading and Literature", "Fiction (novels, short stories, fantasy, science fiction)"),
    ("Reading and Literature", "Non-fiction (biographies, history, self-help, psychology)"),
    ("Reading and Literature", "Poetry and poetic forms (haiku, sonnets, free verse)"),
    ("Reading and Literature", "Literary analysis and book discussions"),
    ("Reading and Literature", "Reading challenges and book clubs"),
    ("Reading and Literature", "Audio books and storytelling podcasts"),

    # Outdoor Activities
    ("Outdoor Activities", "Hiking and nature walks"),
    ("Outdoor Activities", "Camping (tent camping, RV camping)"),
    ("Outdoor Activities", "Wilderness survival skills"),
    
    # Add rest here...
    
    # Final section shown in screenshot:
    ("Health and Wellness", "Practicing mindfulness meditation"),
    ("Health and Wellness", "Yoga retreats wellness tourism"),
    ("Health and Wellness", "Holistic health practices (acupuncture herbalism)"),
    ("Health and Wellness", "Fitness obstacle course races"),
    ("Health & Wellness",   "Nutrition planning meal prepping")
]

# === Config === #
PERCENT_WITH_INTERESTS = 0.98          # Apply to ~98% of donors
MAX_INTERESTS_PER_DONOR = 3            # Cap at 3 interests per person

np.random.seed(42)

def generate_random_text_id(length=10):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

# === Load Donors File === #
df_donors = pd.read_csv('donors_rows.csv')
total_donors = len(df_donors)
num_selected = int(total_donors * PERCENT_WITH_INTERESTS)

selected_df = df_donors.sample(n=num_selected).reset_index(drop=True)
interest_records = []

for _, row in selected_df.iterrows():
    donor_id        = row['donor_id']
    
    num_interests   = np.random.randint(1, MAX_INTERESTS_PER_DONOR + 1)
    
    chosen_pairs = random.sample(INTEREST_LIST, num_interests)
    
    for category, name in chosen_pairs:
        record = {
            'id': generate_random_text_id(),
            'donor_id': donor_id,
            'interest_category': category.strip(),
            'interest_name': name.strip()
        }
        interest_records.append(record)

# === Save Output CSV === #
output_file_path = os.path.join(os.getcwd(), 'formatted_donor_interests.csv')
pd.DataFrame(interest_records).to_csv(output_file_path, index=False)

print(f"\n✅ Generated {len(interest_records)} interest records for {num_selected} donors.")
print(f"📁 Saved at:\n→ {output_file_path}")