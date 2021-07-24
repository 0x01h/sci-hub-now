# This script makes a red outline around a png icon.
# It requires imagemagick (tested on version 7.0.9-2)

if [ -z "$2" ]; then
  echo "Usage: ./outline.sh [filename] [# pixels to dilate]"
  exit 1
fi

outfile=$(echo $1 | gsed "s/_.*\././g")
if [[ "$outfile" == "$1" ]]; then
  infile="$1_bak"
  echo "Output would overwrite file.  Making a backup as $infile"
  cp $1 $infile
else
  infile=$1
fi

convert $infile \( +clone -fill White -colorize 100% -background Black -flatten -morphology Dilate Disk:$2 -alpha Copy -fill Red -colorize 100% \) -compose DstOver -composite $outfile
