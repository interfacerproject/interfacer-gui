echo "Deploy starting..."

git submodule update --init --recursive
pnpm install || exit

pnpm run build || exit

pnpm run reload

echo "Deploy done."
