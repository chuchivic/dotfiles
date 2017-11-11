(function() {
  var meta;

  meta = {
    define: "https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/metaKey",
    key: (function() {
      switch (process.platform) {
        case "darwin":
          return "⌘";
        case "linux":
          return "Super";
        case "win32":
          return "❖";
      }
    })()
  };

  module.exports = {
    general: {
      order: 1,
      type: "object",
      properties: {
        gitPath: {
          order: 1,
          title: "Git Path",
          type: "string",
          "default": "git",
          description: "If git is not in your PATH, specify where the executable is"
        },
        enableStatusBarIcon: {
          order: 2,
          title: "Status-bar Pin Icon",
          type: "boolean",
          "default": true,
          description: "The pin icon in the bottom-right of the status-bar toggles the output view above the status-bar"
        },
        newBranchKey: {
          order: 3,
          title: "Status-bar New Branch modifier key",
          type: "string",
          "default": "alt",
          description: "Status-bar branch list modifier key to alternatively create a new branch if held on click. Note that _[`meta`](" + meta.define + ")_ is <kbd>" + meta.key + "</kbd>",
          "enum": ["alt", "shift", "meta", "ctrl"]
        },
        openInPane: {
          order: 4,
          title: "Allow commands to open new panes",
          type: "boolean",
          "default": true,
          description: "Commands like `Commit`, `Log`, `Show`, `Diff` can be split into new panes"
        },
        splitPane: {
          order: 5,
          title: "Split pane direction",
          type: "string",
          "default": "Down",
          description: "Where should new panes go?",
          "enum": ["Up", "Right", "Down", "Left"]
        },
        showFormat: {
          order: 6,
          title: "Format option for 'Git Show'",
          type: "string",
          "default": "full",
          "enum": ["oneline", "short", "medium", "full", "fuller", "email", "raw", "none"],
          description: "Which format to use for `git show`? (`none` will use your git config default)"
        }
      }
    },
    commits: {
      order: 2,
      type: "object",
      properties: {
        verboseCommits: {
          title: "Verbose Commits",
          description: "Show diffs in commit pane?",
          type: "boolean",
          "default": false
        }
      }
    },
    diffs: {
      order: 3,
      type: "object",
      properties: {
        includeStagedDiff: {
          order: 1,
          title: "Include staged diffs?",
          type: "boolean",
          "default": true
        },
        wordDiff: {
          order: 2,
          title: "Word diff",
          type: "boolean",
          "default": false,
          description: "Should diffs be generated with the `--word-diff` flag?"
        },
        syntaxHighlighting: {
          order: 3,
          title: "Enable syntax highlighting in diffs?",
          type: "boolean",
          "default": true
        }
      }
    },
    logs: {
      order: 4,
      type: "object",
      properties: {
        numberOfCommitsToShow: {
          order: 1,
          title: "Number of commits to load",
          type: "integer",
          "default": 25,
          minimum: 1,
          description: "Initial amount of commits to load when running the `Log` command"
        }
      }
    },
    remoteInteractions: {
      order: 5,
      type: "object",
      properties: {
        pullRebase: {
          order: 1,
          title: "Pull Rebase",
          type: "boolean",
          "default": false,
          description: "Pull with `--rebase` flag?"
        },
        pullBeforePush: {
          order: 2,
          title: "Pull Before Pushing",
          type: "boolean",
          "default": false,
          description: "Pull from remote before pushing"
        },
        promptForBranch: {
          order: 3,
          title: "Prompt for branch selection when pulling/pushing",
          type: "boolean",
          "default": false,
          description: "If false, it defaults to current branch upstream"
        }
      }
    },
    tags: {
      order: 6,
      type: "object",
      properties: {
        signTags: {
          title: "Sign git tags with GPG",
          type: "boolean",
          "default": false,
          description: "Use a GPG key to sign Git tags"
        }
      }
    },
    experimental: {
      order: 7,
      type: "object",
      properties: {
        stageFilesBeta: {
          order: 1,
          title: "Stage Files Beta",
          type: "boolean",
          "default": true,
          description: "Stage and unstage files in a single command"
        },
        customCommands: {
          order: 2,
          title: "Custom Commands",
          type: "boolean",
          "default": false,
          description: "Declared custom commands in your `init` file that can be run from the Git-plus command palette"
        },
        diffBranches: {
          order: 3,
          title: "Show diffs across branches",
          type: "boolean",
          "default": false,
          description: "Diffs will be shown for the current branch against a branch you choose. The `Diff branch files` command will allow choosing which file to compare. The file feature requires the 'split-diff' package to be installed."
        },
        useSplitDiff: {
          order: 4,
          title: "Split diff",
          type: "boolean",
          "default": false,
          description: "Use the split-diff package to show diffs for a single file. Only works with `Diff` command when a file is open."
        },
        autoFetch: {
          order: 5,
          title: "Auto-fetch",
          type: "integer",
          "default": 0,
          maximum: 60,
          description: "Automatically fetch remote repositories every `x` minutes (`0` will disable this feature)"
        },
        autoFetchNotify: {
          order: 6,
          title: "Auto-fetch notification",
          type: "boolean",
          "default": false,
          description: "Show notifications while running `fetch --all`?"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL2NvbmZpZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FDRTtJQUFBLE1BQUEsRUFBUSxxRUFBUjtJQUNBLEdBQUE7QUFDRSxjQUFPLE9BQU8sQ0FBQyxRQUFmO0FBQUEsYUFDTyxRQURQO2lCQUNxQjtBQURyQixhQUVPLE9BRlA7aUJBRW9CO0FBRnBCLGFBR08sT0FIUDtpQkFHb0I7QUFIcEI7UUFGRjs7O0VBT0YsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE9BQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxDQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxVQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxVQURQO1VBRUEsSUFBQSxFQUFNLFFBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7VUFJQSxXQUFBLEVBQWEsNkRBSmI7U0FERjtRQU1BLG1CQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxxQkFEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1VBSUEsV0FBQSxFQUFhLGlHQUpiO1NBUEY7UUFZQSxZQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxvQ0FEUDtVQUVBLElBQUEsRUFBTSxRQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1VBSUEsV0FBQSxFQUFhLGlIQUFBLEdBQWtILElBQUksQ0FBQyxNQUF2SCxHQUE4SCxhQUE5SCxHQUEySSxJQUFJLENBQUMsR0FBaEosR0FBb0osUUFKaks7VUFLQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsS0FBRCxFQUFRLE9BQVIsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsQ0FMTjtTQWJGO1FBbUJBLFVBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLGtDQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7VUFJQSxXQUFBLEVBQWEsMkVBSmI7U0FwQkY7UUF5QkEsU0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sc0JBRFA7VUFFQSxJQUFBLEVBQU0sUUFGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFIVDtVQUlBLFdBQUEsRUFBYSw0QkFKYjtVQUtBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQixNQUFoQixFQUF3QixNQUF4QixDQUxOO1NBMUJGO1FBZ0NBLFVBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLDhCQURQO1VBRUEsSUFBQSxFQUFNLFFBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BSFQ7VUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsU0FBRCxFQUFZLE9BQVosRUFBcUIsUUFBckIsRUFBK0IsTUFBL0IsRUFBdUMsUUFBdkMsRUFBaUQsT0FBakQsRUFBMEQsS0FBMUQsRUFBaUUsTUFBakUsQ0FKTjtVQUtBLFdBQUEsRUFBYSwrRUFMYjtTQWpDRjtPQUhGO0tBREY7SUEyQ0EsT0FBQSxFQUNFO01BQUEsS0FBQSxFQUFPLENBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLFVBQUEsRUFDRTtRQUFBLGNBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxpQkFBUDtVQUNBLFdBQUEsRUFBYSw0QkFEYjtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1NBREY7T0FIRjtLQTVDRjtJQW9EQSxLQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sQ0FBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsVUFBQSxFQUNFO1FBQUEsaUJBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLHVCQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7U0FERjtRQUtBLFFBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLFdBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSx3REFKYjtTQU5GO1FBV0Esa0JBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLHNDQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7U0FaRjtPQUhGO0tBckRGO0lBd0VBLElBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxDQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxVQUFBLEVBQ0U7UUFBQSxxQkFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sMkJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFIVDtVQUlBLE9BQUEsRUFBUyxDQUpUO1VBS0EsV0FBQSxFQUFhLGtFQUxiO1NBREY7T0FIRjtLQXpFRjtJQW1GQSxrQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLENBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLFVBQUEsRUFDRTtRQUFBLFVBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLGFBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSw0QkFKYjtTQURGO1FBTUEsY0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8scUJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxpQ0FKYjtTQVBGO1FBWUEsZUFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sa0RBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxrREFKYjtTQWJGO09BSEY7S0FwRkY7SUF5R0EsSUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLENBQVA7TUFDQSxJQUFBLEVBQU0sUUFETjtNQUVBLFVBQUEsRUFDRTtRQUFBLFFBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyx3QkFBUDtVQUNBLElBQUEsRUFBTSxTQUROO1VBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO1VBR0EsV0FBQSxFQUFhLGdDQUhiO1NBREY7T0FIRjtLQTFHRjtJQWtIQSxZQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sQ0FBUDtNQUNBLElBQUEsRUFBTSxRQUROO01BRUEsVUFBQSxFQUNFO1FBQUEsY0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sa0JBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFIVDtVQUlBLFdBQUEsRUFBYSw2Q0FKYjtTQURGO1FBTUEsY0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8saUJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxnR0FKYjtTQVBGO1FBWUEsWUFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sNEJBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSx3TkFKYjtTQWJGO1FBa0JBLFlBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLFlBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtVQUlBLFdBQUEsRUFBYSxpSEFKYjtTQW5CRjtRQXdCQSxTQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxZQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBSFQ7VUFJQSxPQUFBLEVBQVMsRUFKVDtVQUtBLFdBQUEsRUFBYSwyRkFMYjtTQXpCRjtRQStCQSxlQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyx5QkFEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1VBSUEsV0FBQSxFQUFhLGlEQUpiO1NBaENGO09BSEY7S0FuSEY7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJtZXRhID0gI0tleVxuICBkZWZpbmU6IFwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL01vdXNlRXZlbnQvbWV0YUtleVwiXG4gIGtleTpcbiAgICBzd2l0Y2ggcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgd2hlbiBcImRhcndpblwiIHRoZW4gXCLijJhcIlxuICAgICAgd2hlbiBcImxpbnV4XCIgdGhlbiBcIlN1cGVyXCJcbiAgICAgIHdoZW4gXCJ3aW4zMlwiIHRoZW4gXCLinZZcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdlbmVyYWw6XG4gICAgb3JkZXI6IDFcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIGdpdFBhdGg6XG4gICAgICAgIG9yZGVyOiAxXG4gICAgICAgIHRpdGxlOiBcIkdpdCBQYXRoXCJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICBkZWZhdWx0OiBcImdpdFwiXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGdpdCBpcyBub3QgaW4geW91ciBQQVRILCBzcGVjaWZ5IHdoZXJlIHRoZSBleGVjdXRhYmxlIGlzXCJcbiAgICAgIGVuYWJsZVN0YXR1c0Jhckljb246XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIlN0YXR1cy1iYXIgUGluIEljb25cIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBwaW4gaWNvbiBpbiB0aGUgYm90dG9tLXJpZ2h0IG9mIHRoZSBzdGF0dXMtYmFyIHRvZ2dsZXMgdGhlIG91dHB1dCB2aWV3IGFib3ZlIHRoZSBzdGF0dXMtYmFyXCJcbiAgICAgIG5ld0JyYW5jaEtleTpcbiAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgdGl0bGU6IFwiU3RhdHVzLWJhciBOZXcgQnJhbmNoIG1vZGlmaWVyIGtleVwiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJhbHRcIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTdGF0dXMtYmFyIGJyYW5jaCBsaXN0IG1vZGlmaWVyIGtleSB0byBhbHRlcm5hdGl2ZWx5IGNyZWF0ZSBhIG5ldyBicmFuY2ggaWYgaGVsZCBvbiBjbGljay4gTm90ZSB0aGF0IF9bYG1ldGFgXSgje21ldGEuZGVmaW5lfSlfIGlzIDxrYmQ+I3ttZXRhLmtleX08L2tiZD5cIlxuICAgICAgICBlbnVtOiBbXCJhbHRcIiwgXCJzaGlmdFwiLCBcIm1ldGFcIiwgXCJjdHJsXCJdXG4gICAgICBvcGVuSW5QYW5lOlxuICAgICAgICBvcmRlcjogNFxuICAgICAgICB0aXRsZTogXCJBbGxvdyBjb21tYW5kcyB0byBvcGVuIG5ldyBwYW5lc1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQ29tbWFuZHMgbGlrZSBgQ29tbWl0YCwgYExvZ2AsIGBTaG93YCwgYERpZmZgIGNhbiBiZSBzcGxpdCBpbnRvIG5ldyBwYW5lc1wiXG4gICAgICBzcGxpdFBhbmU6XG4gICAgICAgIG9yZGVyOiA1XG4gICAgICAgIHRpdGxlOiBcIlNwbGl0IHBhbmUgZGlyZWN0aW9uXCJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICBkZWZhdWx0OiBcIkRvd25cIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJXaGVyZSBzaG91bGQgbmV3IHBhbmVzIGdvP1wiXG4gICAgICAgIGVudW06IFtcIlVwXCIsIFwiUmlnaHRcIiwgXCJEb3duXCIsIFwiTGVmdFwiXVxuICAgICAgc2hvd0Zvcm1hdDpcbiAgICAgICAgb3JkZXI6IDZcbiAgICAgICAgdGl0bGU6IFwiRm9ybWF0IG9wdGlvbiBmb3IgJ0dpdCBTaG93J1wiXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCJcbiAgICAgICAgZGVmYXVsdDogXCJmdWxsXCJcbiAgICAgICAgZW51bTogW1wib25lbGluZVwiLCBcInNob3J0XCIsIFwibWVkaXVtXCIsIFwiZnVsbFwiLCBcImZ1bGxlclwiLCBcImVtYWlsXCIsIFwicmF3XCIsIFwibm9uZVwiXVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJXaGljaCBmb3JtYXQgdG8gdXNlIGZvciBgZ2l0IHNob3dgPyAoYG5vbmVgIHdpbGwgdXNlIHlvdXIgZ2l0IGNvbmZpZyBkZWZhdWx0KVwiXG4gIGNvbW1pdHM6XG4gICAgb3JkZXI6IDJcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHZlcmJvc2VDb21taXRzOlxuICAgICAgICB0aXRsZTogXCJWZXJib3NlIENvbW1pdHNcIlxuICAgICAgICBkZXNjcmlwdGlvbjogXCJTaG93IGRpZmZzIGluIGNvbW1pdCBwYW5lP1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gIGRpZmZzOlxuICAgIG9yZGVyOiAzXG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBpbmNsdWRlU3RhZ2VkRGlmZjpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiSW5jbHVkZSBzdGFnZWQgZGlmZnM/XCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgd29yZERpZmY6XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIldvcmQgZGlmZlwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlNob3VsZCBkaWZmcyBiZSBnZW5lcmF0ZWQgd2l0aCB0aGUgYC0td29yZC1kaWZmYCBmbGFnP1wiXG4gICAgICBzeW50YXhIaWdobGlnaHRpbmc6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIkVuYWJsZSBzeW50YXggaGlnaGxpZ2h0aW5nIGluIGRpZmZzP1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgbG9nczpcbiAgICBvcmRlcjogNFxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgbnVtYmVyT2ZDb21taXRzVG9TaG93OlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJOdW1iZXIgb2YgY29tbWl0cyB0byBsb2FkXCJcbiAgICAgICAgdHlwZTogXCJpbnRlZ2VyXCJcbiAgICAgICAgZGVmYXVsdDogMjVcbiAgICAgICAgbWluaW11bTogMVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJbml0aWFsIGFtb3VudCBvZiBjb21taXRzIHRvIGxvYWQgd2hlbiBydW5uaW5nIHRoZSBgTG9nYCBjb21tYW5kXCJcbiAgcmVtb3RlSW50ZXJhY3Rpb25zOlxuICAgIG9yZGVyOiA1XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBwdWxsUmViYXNlOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJQdWxsIFJlYmFzZVwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlB1bGwgd2l0aCBgLS1yZWJhc2VgIGZsYWc/XCJcbiAgICAgIHB1bGxCZWZvcmVQdXNoOlxuICAgICAgICBvcmRlcjogMlxuICAgICAgICB0aXRsZTogXCJQdWxsIEJlZm9yZSBQdXNoaW5nXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUHVsbCBmcm9tIHJlbW90ZSBiZWZvcmUgcHVzaGluZ1wiXG4gICAgICBwcm9tcHRGb3JCcmFuY2g6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIlByb21wdCBmb3IgYnJhbmNoIHNlbGVjdGlvbiB3aGVuIHB1bGxpbmcvcHVzaGluZ1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIklmIGZhbHNlLCBpdCBkZWZhdWx0cyB0byBjdXJyZW50IGJyYW5jaCB1cHN0cmVhbVwiXG4gIHRhZ3M6XG4gICAgb3JkZXI6IDZcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHNpZ25UYWdzOlxuICAgICAgICB0aXRsZTogXCJTaWduIGdpdCB0YWdzIHdpdGggR1BHXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVXNlIGEgR1BHIGtleSB0byBzaWduIEdpdCB0YWdzXCJcbiAgZXhwZXJpbWVudGFsOlxuICAgIG9yZGVyOiA3XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBzdGFnZUZpbGVzQmV0YTpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiU3RhZ2UgRmlsZXMgQmV0YVwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU3RhZ2UgYW5kIHVuc3RhZ2UgZmlsZXMgaW4gYSBzaW5nbGUgY29tbWFuZFwiXG4gICAgICBjdXN0b21Db21tYW5kczpcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgdGl0bGU6IFwiQ3VzdG9tIENvbW1hbmRzXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiRGVjbGFyZWQgY3VzdG9tIGNvbW1hbmRzIGluIHlvdXIgYGluaXRgIGZpbGUgdGhhdCBjYW4gYmUgcnVuIGZyb20gdGhlIEdpdC1wbHVzIGNvbW1hbmQgcGFsZXR0ZVwiXG4gICAgICBkaWZmQnJhbmNoZXM6XG4gICAgICAgIG9yZGVyOiAzXG4gICAgICAgIHRpdGxlOiBcIlNob3cgZGlmZnMgYWNyb3NzIGJyYW5jaGVzXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiRGlmZnMgd2lsbCBiZSBzaG93biBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoIGFnYWluc3QgYSBicmFuY2ggeW91IGNob29zZS4gVGhlIGBEaWZmIGJyYW5jaCBmaWxlc2AgY29tbWFuZCB3aWxsIGFsbG93IGNob29zaW5nIHdoaWNoIGZpbGUgdG8gY29tcGFyZS4gVGhlIGZpbGUgZmVhdHVyZSByZXF1aXJlcyB0aGUgJ3NwbGl0LWRpZmYnIHBhY2thZ2UgdG8gYmUgaW5zdGFsbGVkLlwiXG4gICAgICB1c2VTcGxpdERpZmY6XG4gICAgICAgIG9yZGVyOiA0XG4gICAgICAgIHRpdGxlOiBcIlNwbGl0IGRpZmZcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJVc2UgdGhlIHNwbGl0LWRpZmYgcGFja2FnZSB0byBzaG93IGRpZmZzIGZvciBhIHNpbmdsZSBmaWxlLiBPbmx5IHdvcmtzIHdpdGggYERpZmZgIGNvbW1hbmQgd2hlbiBhIGZpbGUgaXMgb3Blbi5cIlxuICAgICAgYXV0b0ZldGNoOlxuICAgICAgICBvcmRlcjogNVxuICAgICAgICB0aXRsZTogXCJBdXRvLWZldGNoXCJcbiAgICAgICAgdHlwZTogXCJpbnRlZ2VyXCJcbiAgICAgICAgZGVmYXVsdDogMFxuICAgICAgICBtYXhpbXVtOiA2MFxuICAgICAgICBkZXNjcmlwdGlvbjogXCJBdXRvbWF0aWNhbGx5IGZldGNoIHJlbW90ZSByZXBvc2l0b3JpZXMgZXZlcnkgYHhgIG1pbnV0ZXMgKGAwYCB3aWxsIGRpc2FibGUgdGhpcyBmZWF0dXJlKVwiXG4gICAgICBhdXRvRmV0Y2hOb3RpZnk6XG4gICAgICAgIG9yZGVyOiA2XG4gICAgICAgIHRpdGxlOiBcIkF1dG8tZmV0Y2ggbm90aWZpY2F0aW9uXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU2hvdyBub3RpZmljYXRpb25zIHdoaWxlIHJ1bm5pbmcgYGZldGNoIC0tYWxsYD9cIlxuIl19
