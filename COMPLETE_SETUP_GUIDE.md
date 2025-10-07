# 🚀 Complete Setup Instructions for AutoLyrixFlow

Your repository already has an excellent foundation! Here's how to complete the backend integration:

## 📁 Files to Add

I've created the missing backend files that your GitHub Actions workflow needs:

### 1. **Backend Processing Script**
- **File**: `align_lyrics.py`
- **Location**: Root of your repository
- **Purpose**: The Python script your GitHub Actions workflow calls

### 2. **Frontend Integration Hook**  
- **File**: `useAutoLyrixAlign.tsx`
- **Location**: `src/hooks/` or `src/lib/`
- **Purpose**: React hook to connect frontend to GitHub Actions

### 3. **Example Component**
- **File**: `AlignmentInterface.tsx` 
- **Location**: `src/components/`
- **Purpose**: Shows how to integrate with your existing Lovable UI

## 🔧 Setup Steps

### Step 1: Add Backend Files

```bash
# Clone your repository (if not already local)
git clone https://github.com/kravitzcoder/auto-lyrix-flow.git
cd auto-lyrix-flow

# Add the Python processing script to root
# (Copy the align_lyrics.py content I created)

# Add the React files to appropriate directories
mkdir -p src/hooks src/components
# (Copy useAutoLyrixAlign.tsx to src/hooks/)
# (Copy AlignmentInterface.tsx to src/components/)

# Commit the changes
git add .
git commit -m "Add backend processing and frontend integration"
git push
```

### Step 2: Environment Variables

#### GitHub Token Setup:
1. **Generate GitHub Token**:
   - Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes:
     - ✅ `repo` (Full repository access)
     - ✅ `workflow` (Update GitHub Action workflows)
   - Copy the generated token

2. **Add to Netlify**:
   - Go to your [Netlify dashboard](https://app.netlify.com/)
   - Find your AutoLyrixFlow site
   - Go to **Site settings → Environment variables**
   - Add new variable:
     - **Key**: `VITE_GITHUB_TOKEN`
     - **Value**: Your GitHub token

3. **Update Vite Config** (add to `vite.config.ts`):
```typescript
export default defineConfig({
  // ... existing config
  define: {
    'import.meta.env.VITE_GITHUB_TOKEN': JSON.stringify(process.env.VITE_GITHUB_TOKEN)
  }
});
```

### Step 3: Update Your Lovable Frontend

In your existing Lovable components, integrate the new functionality:

```typescript
// In your main alignment component
import { AlignmentInterface } from '@/components/AlignmentInterface';
import { useAutoLyrixAlign } from '@/hooks/useAutoLyrixAlign';

// Replace or enhance your existing "Start Alignment" functionality
export function YourExistingComponent() {
  return (
    <div>
      {/* Your existing beautiful Lovable UI */}
      
      {/* Add the new backend-connected functionality */}
      <AlignmentInterface />
    </div>
  );
}
```

Or integrate the hook directly into your existing components:

```typescript
// In your existing upload component
import { useAutoLyrixAlign } from '@/hooks/useAutoLyrixAlign';

export function YourUploadComponent() {
  const { startAlignment, isProcessing, progress, results } = useAutoLyrixAlign();
  
  const handleStartAlignment = async () => {
    if (audioFile && lyricsText) {
      await startAlignment(audioFile, lyricsText, 'lrc');
    }
  };

  return (
    // Your existing beautiful UI with new functionality
    <Button onClick={handleStartAlignment} disabled={isProcessing}>
      {isProcessing ? `Processing... ${progress}%` : 'Start Alignment'}
    </Button>
  );
}
```

### Step 4: Test the Integration

#### Quick Manual Test:
1. **GitHub Actions Test**:
   - Go to your repository → **Actions** tab
   - Click "**AutoLyrixAlign Processing**"
   - Click "**Run workflow**"
   - Fill in test parameters:
     - **Audio URL**: `https://file-examples.com/storage/fe86c67b6c80e4c4bb09fd6/2017/11/file_example_MP3_700KB.mp3`
     - **Lyrics**: `Hello world this is a test song`
     - **Output Format**: `lrc`
     - **Job ID**: `test-123`
   - Click "**Run workflow**"
   - Monitor the progress in the Actions tab

2. **Frontend Test**:
   - Deploy your updated code to Netlify
   - Test the file upload and alignment in your web interface

## 🎯 What This Gives You

### Complete Workflow:
```
Beautiful Lovable UI → File Upload → GitHub Actions → AI Processing → Download Results
```

### Integrated Features:
- ✅ **File upload with validation**
- ✅ **Real-time progress tracking** 
- ✅ **Multiple export formats** (LRC, JSON, SRT)
- ✅ **Error handling and recovery**
- ✅ **Professional status indicators**
- ✅ **Seamless user experience**

## 🐛 Troubleshooting

### Common Issues:

1. **"GitHub token not found"**
   ```bash
   # Check if environment variable is set correctly
   echo $VITE_GITHUB_TOKEN
   ```
   - Verify token is added to Netlify environment variables
   - Ensure token has correct permissions

2. **"Workflow not triggering"**
   - Check if `align_lyrics.py` is in repository root
   - Verify GitHub Actions are enabled in repository settings
   - Check Actions tab for error logs

3. **"Processing fails"**
   - Start with small test files (< 5MB)
   - Check GitHub Actions logs for specific errors
   - Verify audio file format is supported

4. **"Frontend not connecting"**
   - Check browser console for JavaScript errors
   - Verify environment variables are properly loaded
   - Test with browser developer tools network tab

### Debug Steps:

1. **Check GitHub Actions Logs**:
   - Repository → Actions → Click on failed run
   - Examine each step for error messages

2. **Check Browser Console**:
   - F12 → Console tab
   - Look for JavaScript errors or API failures

3. **Verify File Paths**:
   ```bash
   # Ensure files are in correct locations
   ls -la align_lyrics.py                    # Root directory
   ls -la src/hooks/useAutoLyrixAlign.tsx   # Hooks directory
   ls -la src/components/AlignmentInterface.tsx  # Components directory
   ```

## 🚧 Next Steps

### Immediate (Get it working):
1. ✅ Add the backend files to your repository
2. ✅ Set up GitHub token in Netlify
3. ✅ Test with a small audio file
4. ✅ Integrate with your existing Lovable UI

### Future Enhancements:
- 🔄 **Real AutoLyrixAlign Model**: Replace placeholder with actual trained model
- 📊 **Advanced Analytics**: Track usage and performance metrics  
- 🎵 **Audio Visualization**: Add waveform display during processing
- 👥 **User Accounts**: Save processing history and preferences
- ⚡ **Performance Optimization**: Faster processing for large files

## 💡 Tips for Success

1. **Start Small**: Test with short audio files (< 30 seconds) initially
2. **Monitor Logs**: Always check GitHub Actions logs for debugging
3. **Iterative Development**: Test each component separately before full integration
4. **User Feedback**: Add clear error messages and progress indicators

## 🎉 You're Almost There!

Your AutoLyrixFlow has:
- ✅ **Beautiful Frontend** (Lovable-generated)
- ✅ **Professional Backend** (GitHub Actions) 
- ✅ **Modern Tech Stack** (React, TypeScript, Tailwind)
- ✅ **Automated Deployment** (Netlify)

Just add these files and you'll have a fully functional, production-ready lyrics alignment service! 🚀

## 📞 Need Help?

If you encounter issues:
1. Check this guide first
2. Look at GitHub Actions logs
3. Test with the manual workflow trigger
4. Start with small files for initial testing

Happy coding! 🎵✨