"""Merge the seat research (out1.json … outN.json, one object keyed by chain each) into DATA/rewards.json, which
build.py reads for the "Earns a year" line.   python3 scripts/l1_openings/merge_rewards.py <folder of out*.json> <DATA>"""
import glob, json, os, sys
src, data = sys.argv[1], sys.argv[2]
merged = {}
for f in sorted(glob.glob(os.path.join(src, "out*.json"))):
    merged.update(json.load(open(f)))
json.dump(merged, open(os.path.join(data, "rewards.json"), "w"), indent=1, ensure_ascii=False)
full = sum(1 for v in merged.values() if all(isinstance(v.get(k), (int, float)) for k in ("apr", "total_staked_usd", "active_validators")))
fixed = sum(1 for v in merged.values() if isinstance(v.get("earns_usd"), (int, float)))
print(len(merged), "chains;", full, "with rate, stake and set;", fixed, "paid a fixed sum")
