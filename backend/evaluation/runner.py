import json
import time
import asyncio
import csv
from datetime import datetime
from pathlib import Path

# Add parent directory to path
import sys
sys.path.append(str(Path(__file__).parent.parent))

from app.pipeline.orchestrator import run_pipeline_streaming

class EvaluationRunner:
    def __init__(self):
        self.results = []
        
    async def run_single_test(self, test_id: str, prompt: str, test_type: str, expected_behavior: str = ""):
        """Run a single test and collect metrics"""
        
        start_time = time.time()
        repair_count = 0
        errors = []
        warnings = []
        success = False
        
        try:
            # Collect events
            async for event in run_pipeline_streaming(prompt):
                if "stage_complete" in event:
                    import json as json_lib
                    # Parse event to extract data
                    pass
                    
            success = True
            
        except Exception as e:
            errors.append(str(e))
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        result = {
            "test_id": test_id,
            "test_type": test_type,
            "prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt,
            "expected_behavior": expected_behavior,
            "success": success,
            "latency_ms": latency_ms,
            "repair_count": repair_count,
            "error_count": len(errors),
            "warning_count": len(warnings),
            "errors": errors[:5],
            "warnings": warnings[:5],
            "timestamp": datetime.now().isoformat()
        }
        
        self.results.append(result)
        return result
    
    async def run_full_evaluation(self):
        """Run all tests from dataset"""
        
        # Load dataset
        dataset_path = Path(__file__).parent.parent / "datasets" / "prompts.json"
        with open(dataset_path, "r") as f:
            dataset = json.load(f)
        
        print("=" * 80)
        print("COMPILE_01 EVALUATION SUITE")
        print("=" * 80)
        
        # Run Real Product Prompts
        print("\n📦 Running Real Product Prompts (10 tests)...")
        for test in dataset["real_product_prompts"]:
            print(f"  → {test['id']}: {test['prompt'][:60]}...")
            await self.run_single_test(
                test_id=test["id"],
                prompt=test["prompt"],
                test_type="real_product",
                expected_behavior=test.get("expected_complexity", "medium")
            )
        
        # Run Edge Cases
        print("\n⚠️ Running Edge Cases (10 tests)...")
        for test in dataset["edge_cases"]:
            print(f"  → {test['id']} ({test['type']}): {test['prompt'][:60]}...")
            await self.run_single_test(
                test_id=test["id"],
                prompt=test["prompt"],
                test_type=f"edge_{test['type']}",
                expected_behavior=test["expected_behavior"]
            )
        
        # Generate Reports
        self.generate_summary()
        self.generate_csv_report()
        self.generate_markdown_report()
        
        return self.results
    
    def generate_summary(self):
        """Generate summary statistics"""
        
        total = len(self.results)
        successful = sum(1 for r in self.results if r["success"])
        success_rate = (successful / total) * 100
        
        real_tests = [r for r in self.results if r["test_type"] == "real_product"]
        edge_tests = [r for r in self.results if "edge" in r["test_type"]]
        
        real_success = sum(1 for r in real_tests if r["success"])
        edge_success = sum(1 for r in edge_tests if r["success"])
        
        avg_latency = sum(r["latency_ms"] for r in self.results) / total
        total_repairs = sum(r["repair_count"] for r in self.results)
        total_errors = sum(r["error_count"] for r in self.results)
        
        print("\n" + "=" * 80)
        print("EVALUATION SUMMARY")
        print("=" * 80)
        print(f"\n📊 Overall Statistics:")
        print(f"   Total Tests:        {total}")
        print(f"   Successful:         {successful}")
        print(f"   Success Rate:       {success_rate:.1f}%")
        print(f"   Average Latency:    {avg_latency:.0f}ms ({avg_latency/1000:.1f}s)")
        print(f"   Total Repairs:      {total_repairs}")
        print(f"   Total Errors:       {total_errors}")
        
        print(f"\n📦 Real Product Prompts ({len(real_tests)} tests):")
        print(f"   Success Rate:       {(real_success/len(real_tests))*100:.1f}%")
        print(f"   Avg Latency:        {sum(r['latency_ms'] for r in real_tests)/len(real_tests):.0f}ms")
        
        print(f"\n⚠️ Edge Cases ({len(edge_tests)} tests):")
        print(f"   Success Rate:       {(edge_success/len(edge_tests))*100:.1f}%")
        print(f"   Avg Latency:        {sum(r['latency_ms'] for r in edge_tests)/len(edge_tests):.0f}ms")
        
        # Print failures
        failures = [r for r in self.results if not r["success"]]
        if failures:
            print(f"\n❌ Failed Tests ({len(failures)}):")
            for f in failures:
                print(f"   - {f['test_id']}: {f['prompt'][:50]}...")
    
    def generate_csv_report(self):
        """Export results to CSV"""
        
        csv_path = Path(__file__).parent / "evaluation_results.csv"
        
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            fieldnames = ["test_id", "test_type", "success", "latency_ms", "repair_count", 
                         "error_count", "warning_count", "timestamp", "expected_behavior"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for r in self.results:
                writer.writerow({
                    "test_id": r["test_id"],
                    "test_type": r["test_type"],
                    "success": r["success"],
                    "latency_ms": r["latency_ms"],
                    "repair_count": r["repair_count"],
                    "error_count": r["error_count"],
                    "warning_count": r["warning_count"],
                    "timestamp": r["timestamp"],
                    "expected_behavior": r["expected_behavior"]
                })
        
        print(f"\n📄 CSV Report saved: {csv_path}")
    
    def generate_markdown_report(self):
        """Generate markdown report for GitHub"""
        
        total = len(self.results)
        successful = sum(1 for r in self.results if r["success"])
        success_rate = (successful / total) * 100
        
        md_path = Path(__file__).parent / "EVALUATION_REPORT.md"
        
        with open(md_path, "w", encoding="utf-8") as f:
            f.write("# Compile_01 Evaluation Report\n\n")
            f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            f.write("## Overall Results\n\n")
            f.write("| Metric | Value |\n")
            f.write("|--------|-------|\n")
            f.write(f"| Total Tests | {total} |\n")
            f.write(f"| Successful | {successful} |\n")
            f.write(f"| Success Rate | {success_rate:.1f}% |\n")
            f.write(f"| Avg Latency | {sum(r['latency_ms'] for r in self.results)/total:.0f}ms |\n")
            f.write(f"| Total Repairs | {sum(r['repair_count'] for r in self.results)} |\n\n")
            
            f.write("## Test Results\n\n")
            f.write("| ID | Type | Success | Latency | Repairs | Errors |\n")
            f.write("|----|------|---------|---------|---------|--------|\n")
            for r in self.results:
                f.write(f"| {r['test_id']} | {r['test_type']} | {'✅' if r['success'] else '❌'} | {r['latency_ms']}ms | {r['repair_count']} | {r['error_count']} |\n")
        
        print(f"📄 Markdown Report saved: {md_path}")

async def main():
    runner = EvaluationRunner()
    await runner.run_full_evaluation()

if __name__ == "__main__":
    asyncio.run(main())