echo "Deploy starting..."

pnpm install || exit

BUILD_DIR=temp pnpm run build || exit

if [ ! -d "temp" ]; then
  echo '\033[31m temp Directory not exists!\033[0m'
  exit 1;
fi

rm -rf .next

mv temp .next

pnpm run reload


echo "Deploy done."
