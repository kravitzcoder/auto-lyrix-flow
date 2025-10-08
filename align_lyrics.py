#!/usr/bin/env python3
"""
AutoLyrixAlign Demo Script
Processes lyrics alignment requests from GitHub Actions

For demo purposes, this creates sample output since we're not sending actual audio files.
In production, this would:
1. Download audio from cloud storage URL
2. Process with actual AI alignment models
3. Generate real LRC files
"""

import os
import json
import argparse
from datetime import datetime
from pathlib import Path

def create_demo_lrc(lyrics_text, job_id, filename):
    """
    Create a demo LRC file with sample timing
    In production, this would use actual AI alignment
    """
    lines = lyrics_text.strip().split('\n')
    lrc_content = []
    
    # Add metadata
    lrc_content.append(f"[ar:Demo Artist]")
    lrc_content.append(f"[ti:Demo Song - {filename}]")
    lrc_content.append(f"[al:AutoLyrixAlign Demo]")
    lrc_content.append(f"[by:AutoLyrixAlign v1.0]")
    lrc_content.append(f"[offset:0]")
    lrc_content.append("")
    
    # Add demo timestamps (2 seconds per line)
    current_time = 0
    for i, line in enumerate(lines[:20]):  # Limit to first 20 lines for demo
        if line.strip():
            minutes = current_time // 60
            seconds = current_time % 60
            timestamp = f"[{minutes:02d}:{seconds:05.2f}]"
            lrc_content.append(f"{timestamp}{line.strip()}")
            current_time += 3  # 3 seconds per line for demo
    
    return "\n".join(lrc_content)

def create_demo_json(lyrics_text, job_id, filename):
    """
    Create demo JSON output with word-level timing
    """
    words = lyrics_text.split()[:50]  # Limit to 50 words for demo
    word_timings = []
    
    current_time = 0.0
    for word in words:
        word_timings.append({
            "word": word,
            "start": current_time,
            "end": current_time + 0.5,
            "confidence": 0.95  # Demo confidence score
        })
        current_time += 0.6
    
    return {
        "job_id": job_id,
        "filename": filename,
        "demo_mode": True,
        "word_count": len(words),
        "duration": current_time,
        "words": word_timings,
        "metadata": {
            "processed_at": datetime.now().isoformat(),
            "model_version": "demo-v1.0",
            "note": "This is demo output. In production, real AI alignment would be performed."
        }
    }

def main():
    parser = argparse.ArgumentParser(description='AutoLyrixAlign Demo Processor')
    parser.add_argument('--audio', help='Audio file info (JSON string with metadata)')
    parser.add_argument('--lyrics', help='Lyrics text content')
    parser.add_argument('--output-format', default='lrc', choices=['lrc', 'json', 'srt'])
    parser.add_argument('--job-id', help='Job ID for tracking')
    
    args = parser.parse_args()
    
    print(f"🎵 AutoLyrixAlign Demo Processing Started")
    print(f"Job ID: {args.job_id}")
    print(f"Output Format: {args.output_format}")
    
    # Create output directory
    output_dir = Path('output')
    output_dir.mkdir(exist_ok=True)
    
    # Parse audio info if provided
    audio_filename = "demo-audio"
    if args.audio:
        try:
            # Try to parse as JSON (new format)
            audio_info = json.loads(args.audio)
            if isinstance(audio_info, dict) and 'filename' in audio_info:
                audio_filename = audio_info['filename']
                print(f"📁 Audio file: {audio_filename} ({audio_info.get('size', 0)} bytes)")
            else:
                audio_filename = "uploaded-audio"
        except json.JSONDecodeError:
            # Fallback for simple string
            audio_filename = "demo-audio"
    
    # Get lyrics
    lyrics = args.lyrics or "Demo lyrics line 1\nDemo lyrics line 2\nDemo lyrics line 3"
    print(f"📝 Lyrics length: {len(lyrics)} characters")
    
    # Simulate processing time
    print("🤖 Processing with AI alignment model...")
    
    # Generate output based on format
    base_filename = f"aligned_{args.job_id or 'demo'}"
    
    if args.output_format == 'lrc':
        output_content = create_demo_lrc(lyrics, args.job_id, audio_filename)
        output_file = output_dir / f"{base_filename}.lrc"
        
    elif args.output_format == 'json':
        output_content = json.dumps(
            create_demo_json(lyrics, args.job_id, audio_filename), 
            indent=2
        )
        output_file = output_dir / f"{base_filename}.json"
        
    elif args.output_format == 'srt':
        # Simple SRT demo (similar to LRC but SRT format)
        lines = lyrics.strip().split('\n')[:10]
        srt_content = []
        current_time = 0
        
        for i, line in enumerate(lines, 1):
            if line.strip():
                start_time = f"00:{current_time//60:02d}:{current_time%60:02d},000"
                end_time = f"00:{(current_time+3)//60:02d}:{(current_time+3)%60:02d},000"
                srt_content.extend([
                    str(i),
                    f"{start_time} --> {end_time}",
                    line.strip(),
                    ""
                ])
                current_time += 3
        
        output_content = "\n".join(srt_content)
        output_file = output_dir / f"{base_filename}.srt"
    
    # Write output file
    output_file.write_text(output_content, encoding='utf-8')
    print(f"✅ Generated: {output_file}")
    
    # Create metadata file
    metadata = {
        "job_id": args.job_id,
        "audio_filename": audio_filename,
        "output_format": args.output_format,
        "output_file": str(output_file),
        "lyrics_length": len(lyrics),
        "processed_at": datetime.now().isoformat(),
        "demo_mode": True,
        "status": "completed"
    }
    
    metadata_file = output_dir / f"{base_filename}_metadata.json"
    metadata_file.write_text(json.dumps(metadata, indent=2), encoding='utf-8')
    print(f"📊 Metadata: {metadata_file}")
    
    print("🎉 Demo processing completed successfully!")
    print("\n📋 Note: This is a demo version. In production:")
    print("   • Real audio files would be processed")
    print("   • AI models would generate actual alignments")
    print("   • Timing would be based on audio analysis")

if __name__ == '__main__':
    main()
