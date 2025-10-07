#!/usr/bin/env python3
"""
AutoLyrixAlign Processing Script for GitHub Actions
This script processes audio and lyrics to create word-level alignment
"""

import sys
import json
import argparse
import urllib.request
import os
from pathlib import Path
import tempfile
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def download_file(url, filename):
    """Download file from URL with progress"""
    try:
        logger.info(f"Downloading file from: {url}")
        urllib.request.urlretrieve(url, filename)
        logger.info(f"File downloaded successfully: {filename}")
        return True
    except Exception as e:
        logger.error(f"Download failed: {e}")
        return False

def simple_alignment(audio_path, lyrics_text, output_format='lrc'):
    """
    Placeholder alignment function - replace with actual AutoLyrixAlign model
    For now, creates a simple time-based alignment
    """
    try:
        # Import audio processing libraries
        import librosa
        import numpy as np
        
        logger.info("Loading audio file...")
        y, sr = librosa.load(audio_path, sr=22050)
        duration = librosa.get_duration(y=y, sr=sr)
        logger.info(f"Audio duration: {duration:.2f} seconds")
        
        # Split lyrics into words
        words = lyrics_text.strip().replace('\n', ' ').split()
        words = [word.strip('.,!?";:') for word in words if word.strip()]
        
        if not words:
            raise ValueError("No valid words found in lyrics")
            
        logger.info(f"Processing {len(words)} words")
        
        # Create simple time alignment (placeholder logic)
        # In production, this would use the actual AutoLyrixAlign model
        word_duration = duration / len(words)
        aligned_words = []
        
        for i, word in enumerate(words):
            start_time = i * word_duration
            end_time = (i + 1) * word_duration
            aligned_words.append({
                'word': word,
                'start': round(start_time, 3),
                'end': round(end_time, 3),
                'confidence': 0.95  # Placeholder confidence
            })
        
        logger.info("Alignment completed successfully")
        return aligned_words
        
    except ImportError as e:
        logger.error(f"Missing required library: {e}")
        # Fallback without audio analysis
        words = lyrics_text.strip().replace('\n', ' ').split()
        words = [word.strip('.,!?";:') for word in words if word.strip()]
        
        # Simple time-based distribution
        total_duration = 120  # Assume 2-minute song
        word_duration = total_duration / len(words)
        
        aligned_words = []
        for i, word in enumerate(words):
            start_time = i * word_duration
            end_time = (i + 1) * word_duration
            aligned_words.append({
                'word': word,
                'start': round(start_time, 3),
                'end': round(end_time, 3),
                'confidence': 0.80
            })
        
        return aligned_words
        
    except Exception as e:
        logger.error(f"Alignment error: {e}")
        return None

def format_lrc(aligned_words):
    """Format as LRC (Lyric file format)"""
    lines = []
    for word_data in aligned_words:
        minutes = int(word_data['start'] // 60)
        seconds = word_data['start'] % 60
        lines.append(f"[{minutes:02d}:{seconds:06.3f}]{word_data['word']}")
    return '\n'.join(lines)

def format_json(aligned_words):
    """Format as JSON"""
    return json.dumps(aligned_words, indent=2)

def format_srt(aligned_words):
    """Format as SRT (SubRip subtitle format)"""
    lines = []
    for i, word_data in enumerate(aligned_words, 1):
        start_time = format_srt_time(word_data['start'])
        end_time = format_srt_time(word_data['end'])
        lines.extend([
            str(i),
            f"{start_time} --> {end_time}",
            word_data['word'],
            ""
        ])
    return '\n'.join(lines)

def format_srt_time(seconds):
    """Convert seconds to SRT time format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:06.3f}".replace('.', ',')

def main():
    parser = argparse.ArgumentParser(description='AutoLyrix Alignment Processing')
    parser.add_argument('--audio', required=True, help='Audio file URL or path')
    parser.add_argument('--lyrics', required=True, help='Lyrics text content')
    parser.add_argument('--output-format', default='lrc', choices=['lrc', 'json', 'srt'], 
                       help='Output format (default: lrc)')
    parser.add_argument('--job-id', help='Job identifier for tracking')
    
    args = parser.parse_args()
    
    try:
        # Create output directory
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        # Download audio file if it's a URL
        if args.audio.startswith(('http://', 'https://')):
            temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
            if not download_file(args.audio, temp_audio.name):
                raise Exception("Failed to download audio file")
            audio_path = temp_audio.name
        else:
            audio_path = args.audio
            
        # Verify audio file exists
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
            
        logger.info("Starting alignment process...")
        
        # Perform alignment
        aligned_words = simple_alignment(audio_path, args.lyrics, args.output_format)
        
        if not aligned_words:
            raise Exception("Alignment failed - no results generated")
            
        # Format output based on requested format
        if args.output_format == 'lrc':
            output_content = format_lrc(aligned_words)
            file_extension = 'lrc'
        elif args.output_format == 'json':
            output_content = format_json(aligned_words)
            file_extension = 'json'
        elif args.output_format == 'srt':
            output_content = format_srt(aligned_words)
            file_extension = 'srt'
        else:
            raise ValueError(f"Unsupported output format: {args.output_format}")
            
        # Save result file
        job_suffix = f"_{args.job_id}" if args.job_id else ""
        output_file = output_dir / f"aligned_lyrics{job_suffix}.{file_extension}"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(output_content)
            
        logger.info(f"Alignment completed! Output saved to: {output_file}")
        
        # Create metadata file
        metadata = {
            'job_id': args.job_id or 'unknown',
            'status': 'completed',
            'output_format': args.output_format,
            'word_count': len(aligned_words),
            'duration': aligned_words[-1]['end'] if aligned_words else 0,
            'average_confidence': sum(w.get('confidence', 0) for w in aligned_words) / len(aligned_words),
            'output_file': str(output_file)
        }
        
        metadata_file = output_dir / f"metadata{job_suffix}.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
            
        logger.info(f"Metadata saved to: {metadata_file}")
        
        # Print summary
        print("="*50)
        print("ALIGNMENT SUMMARY")
        print("="*50)
        print(f"Words processed: {len(aligned_words)}")
        print(f"Duration: {metadata['duration']:.2f} seconds")
        print(f"Output format: {args.output_format}")
        print(f"Output file: {output_file}")
        print("="*50)
        
        # Clean up temporary files
        if args.audio.startswith(('http://', 'https://')):
            try:
                os.unlink(audio_path)
            except:
                pass
                
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        
        # Create error metadata
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        job_suffix = f"_{args.job_id}" if args.job_id else ""
        error_metadata = {
            'job_id': args.job_id or 'unknown',
            'status': 'error',
            'error': str(e),
            'error_type': type(e).__name__
        }
        
        metadata_file = output_dir / f"metadata{job_suffix}.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(error_metadata, f, indent=2)
            
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()