git branch --format="%(refname:short)" | while read branch; do
  if [ "$branch" != "main" ]; then
    echo "Branch: $branch"
    echo "Commits in $branch not in main:"
    git log main..$branch --oneline
    echo "Commits in main not in $branch:"
    git log $branch..main --oneline
    echo ""
  fi
done
