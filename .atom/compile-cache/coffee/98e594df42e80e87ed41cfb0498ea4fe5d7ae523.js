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
        pullAutostash: {
          order: 2,
          title: "Pull AutoStash",
          type: "boolean",
          "default": false,
          description: "Pull with `--autostash` flag?"
        },
        pullBeforePush: {
          order: 3,
          title: "Pull Before Pushing",
          type: "boolean",
          "default": false,
          description: "Pull from remote before pushing"
        },
        promptForBranch: {
          order: 4,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL2NvbmZpZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FDRTtJQUFBLE1BQUEsRUFBUSxxRUFBUjtJQUNBLEdBQUE7QUFDRSxjQUFPLE9BQU8sQ0FBQyxRQUFmO0FBQUEsYUFDTyxRQURQO2lCQUNxQjtBQURyQixhQUVPLE9BRlA7aUJBRW9CO0FBRnBCLGFBR08sT0FIUDtpQkFHb0I7QUFIcEI7UUFGRjs7O0VBT0YsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE9BQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxDQUFQO01BQ0EsSUFBQSxFQUFNLFFBRE47TUFFQSxVQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxVQURQO1VBRUEsSUFBQSxFQUFNLFFBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7VUFJQSxXQUFBLEVBQWEsNkRBSmI7U0FERjtRQU1BLG1CQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxxQkFEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1VBSUEsV0FBQSxFQUFhLGlHQUpiO1NBUEY7UUFZQSxZQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQU8sQ0FBUDtVQUNBLEtBQUEsRUFBTyxvQ0FEUDtVQUVBLElBQUEsRUFBTSxRQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1VBSUEsV0FBQSxFQUFhLGlIQUFBLEdBQWtILElBQUksQ0FBQyxNQUF2SCxHQUE4SCxhQUE5SCxHQUEySSxJQUFJLENBQUMsR0FBaEosR0FBb0osUUFKaks7VUFLQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsS0FBRCxFQUFRLE9BQVIsRUFB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UDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1VBSUEsV0FBQSxFQUFhLHdOQUpiO1NBYkY7UUFrQkEsWUFBQSxFQUNFO1VBQUEsS0FBQSxFQUFPLENBQVA7VUFDQSxLQUFBLEVBQU8sWUFEUDtVQUVBLElBQUEsRUFBTSxTQUZOO1VBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO1VBSUEsV0FBQSxFQUFhLGlIQUpiO1NBbkJGO1FBd0JBLFNBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLFlBRFA7VUFFQSxJQUFBLEVBQU0sU0FGTjtVQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FIVDtVQUlBLE9BQUEsRUFBUyxFQUpUO1VBS0EsV0FBQSxFQUFhLDJGQUxiO1NBekJGO1FBK0JBLGVBQUEsRUFDRTtVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQ0EsS0FBQSxFQUFPLHlCQURQO1VBRUEsSUFBQSxFQUFNLFNBRk47VUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7VUFJQSxXQUFBLEVBQWEsaURBSmI7U0FoQ0Y7T0FIRjtLQXpIRjs7QUFURiIsInNvdXJjZXNDb250ZW50IjpbIm1ldGEgPSAjS2V5XG4gIGRlZmluZTogXCJodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTW91c2VFdmVudC9tZXRhS2V5XCJcbiAga2V5OlxuICAgIHN3aXRjaCBwcm9jZXNzLnBsYXRmb3JtXG4gICAgICB3aGVuIFwiZGFyd2luXCIgdGhlbiBcIuKMmFwiXG4gICAgICB3aGVuIFwibGludXhcIiB0aGVuIFwiU3VwZXJcIlxuICAgICAgd2hlbiBcIndpbjMyXCIgdGhlbiBcIuKdllwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2VuZXJhbDpcbiAgICBvcmRlcjogMVxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgZ2l0UGF0aDpcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgdGl0bGU6IFwiR2l0IFBhdGhcIlxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICAgIGRlZmF1bHQ6IFwiZ2l0XCJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiSWYgZ2l0IGlzIG5vdCBpbiB5b3VyIFBBVEgsIHNwZWNpZnkgd2hlcmUgdGhlIGV4ZWN1dGFibGUgaXNcIlxuICAgICAgZW5hYmxlU3RhdHVzQmFySWNvbjpcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgdGl0bGU6IFwiU3RhdHVzLWJhciBQaW4gSWNvblwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIHBpbiBpY29uIGluIHRoZSBib3R0b20tcmlnaHQgb2YgdGhlIHN0YXR1cy1iYXIgdG9nZ2xlcyB0aGUgb3V0cHV0IHZpZXcgYWJvdmUgdGhlIHN0YXR1cy1iYXJcIlxuICAgICAgbmV3QnJhbmNoS2V5OlxuICAgICAgICBvcmRlcjogM1xuICAgICAgICB0aXRsZTogXCJTdGF0dXMtYmFyIE5ldyBCcmFuY2ggbW9kaWZpZXIga2V5XCJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICBkZWZhdWx0OiBcImFsdFwiXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlN0YXR1cy1iYXIgYnJhbmNoIGxpc3QgbW9kaWZpZXIga2V5IHRvIGFsdGVybmF0aXZlbHkgY3JlYXRlIGEgbmV3IGJyYW5jaCBpZiBoZWxkIG9uIGNsaWNrLiBOb3RlIHRoYXQgX1tgbWV0YWBdKCN7bWV0YS5kZWZpbmV9KV8gaXMgPGtiZD4je21ldGEua2V5fTwva2JkPlwiXG4gICAgICAgIGVudW06IFtcImFsdFwiLCBcInNoaWZ0XCIsIFwibWV0YVwiLCBcImN0cmxcIl1cbiAgICAgIG9wZW5JblBhbmU6XG4gICAgICAgIG9yZGVyOiA0XG4gICAgICAgIHRpdGxlOiBcIkFsbG93IGNvbW1hbmRzIHRvIG9wZW4gbmV3IHBhbmVzXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJDb21tYW5kcyBsaWtlIGBDb21taXRgLCBgTG9nYCwgYFNob3dgLCBgRGlmZmAgY2FuIGJlIHNwbGl0IGludG8gbmV3IHBhbmVzXCJcbiAgICAgIHNwbGl0UGFuZTpcbiAgICAgICAgb3JkZXI6IDVcbiAgICAgICAgdGl0bGU6IFwiU3BsaXQgcGFuZSBkaXJlY3Rpb25cIlxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgICAgIGRlZmF1bHQ6IFwiRG93blwiXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIldoZXJlIHNob3VsZCBuZXcgcGFuZXMgZ28/XCJcbiAgICAgICAgZW51bTogW1wiVXBcIiwgXCJSaWdodFwiLCBcIkRvd25cIiwgXCJMZWZ0XCJdXG4gICAgICBzaG93Rm9ybWF0OlxuICAgICAgICBvcmRlcjogNlxuICAgICAgICB0aXRsZTogXCJGb3JtYXQgb3B0aW9uIGZvciAnR2l0IFNob3cnXCJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuICAgICAgICBkZWZhdWx0OiBcImZ1bGxcIlxuICAgICAgICBlbnVtOiBbXCJvbmVsaW5lXCIsIFwic2hvcnRcIiwgXCJtZWRpdW1cIiwgXCJmdWxsXCIsIFwiZnVsbGVyXCIsIFwiZW1haWxcIiwgXCJyYXdcIiwgXCJub25lXCJdXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIldoaWNoIGZvcm1hdCB0byB1c2UgZm9yIGBnaXQgc2hvd2A/IChgbm9uZWAgd2lsbCB1c2UgeW91ciBnaXQgY29uZmlnIGRlZmF1bHQpXCJcbiAgY29tbWl0czpcbiAgICBvcmRlcjogMlxuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgdmVyYm9zZUNvbW1pdHM6XG4gICAgICAgIHRpdGxlOiBcIlZlcmJvc2UgQ29tbWl0c1wiXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlNob3cgZGlmZnMgaW4gY29tbWl0IHBhbmU/XCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgZGlmZnM6XG4gICAgb3JkZXI6IDNcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIGluY2x1ZGVTdGFnZWREaWZmOlxuICAgICAgICBvcmRlcjogMVxuICAgICAgICB0aXRsZTogXCJJbmNsdWRlIHN0YWdlZCBkaWZmcz9cIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB3b3JkRGlmZjpcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgdGl0bGU6IFwiV29yZCBkaWZmXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiU2hvdWxkIGRpZmZzIGJlIGdlbmVyYXRlZCB3aXRoIHRoZSBgLS13b3JkLWRpZmZgIGZsYWc/XCJcbiAgICAgIHN5bnRheEhpZ2hsaWdodGluZzpcbiAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgdGl0bGU6IFwiRW5hYmxlIHN5bnRheCBoaWdobGlnaHRpbmcgaW4gZGlmZnM/XCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICBsb2dzOlxuICAgIG9yZGVyOiA0XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBudW1iZXJPZkNvbW1pdHNUb1Nob3c6XG4gICAgICAgIG9yZGVyOiAxXG4gICAgICAgIHRpdGxlOiBcIk51bWJlciBvZiBjb21taXRzIHRvIGxvYWRcIlxuICAgICAgICB0eXBlOiBcImludGVnZXJcIlxuICAgICAgICBkZWZhdWx0OiAyNVxuICAgICAgICBtaW5pbXVtOiAxXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkluaXRpYWwgYW1vdW50IG9mIGNvbW1pdHMgdG8gbG9hZCB3aGVuIHJ1bm5pbmcgdGhlIGBMb2dgIGNvbW1hbmRcIlxuICByZW1vdGVJbnRlcmFjdGlvbnM6XG4gICAgb3JkZXI6IDVcbiAgICB0eXBlOiBcIm9iamVjdFwiXG4gICAgcHJvcGVydGllczpcbiAgICAgIHB1bGxSZWJhc2U6XG4gICAgICAgIG9yZGVyOiAxXG4gICAgICAgIHRpdGxlOiBcIlB1bGwgUmViYXNlXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUHVsbCB3aXRoIGAtLXJlYmFzZWAgZmxhZz9cIlxuICAgICAgcHVsbEF1dG9zdGFzaDpcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgICAgdGl0bGU6IFwiUHVsbCBBdXRvU3Rhc2hcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJQdWxsIHdpdGggYC0tYXV0b3N0YXNoYCBmbGFnP1wiXG4gICAgICBwdWxsQmVmb3JlUHVzaDpcbiAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgdGl0bGU6IFwiUHVsbCBCZWZvcmUgUHVzaGluZ1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlB1bGwgZnJvbSByZW1vdGUgYmVmb3JlIHB1c2hpbmdcIlxuICAgICAgcHJvbXB0Rm9yQnJhbmNoOlxuICAgICAgICBvcmRlcjogNFxuICAgICAgICB0aXRsZTogXCJQcm9tcHQgZm9yIGJyYW5jaCBzZWxlY3Rpb24gd2hlbiBwdWxsaW5nL3B1c2hpbmdcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBkZXNjcmlwdGlvbjogXCJJZiBmYWxzZSwgaXQgZGVmYXVsdHMgdG8gY3VycmVudCBicmFuY2ggdXBzdHJlYW1cIlxuICB0YWdzOlxuICAgIG9yZGVyOiA2XG4gICAgdHlwZTogXCJvYmplY3RcIlxuICAgIHByb3BlcnRpZXM6XG4gICAgICBzaWduVGFnczpcbiAgICAgICAgdGl0bGU6IFwiU2lnbiBnaXQgdGFncyB3aXRoIEdQR1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlVzZSBhIEdQRyBrZXkgdG8gc2lnbiBHaXQgdGFnc1wiXG4gIGV4cGVyaW1lbnRhbDpcbiAgICBvcmRlcjogN1xuICAgIHR5cGU6IFwib2JqZWN0XCJcbiAgICBwcm9wZXJ0aWVzOlxuICAgICAgc3RhZ2VGaWxlc0JldGE6XG4gICAgICAgIG9yZGVyOiAxXG4gICAgICAgIHRpdGxlOiBcIlN0YWdlIEZpbGVzIEJldGFcIlxuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlN0YWdlIGFuZCB1bnN0YWdlIGZpbGVzIGluIGEgc2luZ2xlIGNvbW1hbmRcIlxuICAgICAgY3VzdG9tQ29tbWFuZHM6XG4gICAgICAgIG9yZGVyOiAyXG4gICAgICAgIHRpdGxlOiBcIkN1c3RvbSBDb21tYW5kc1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkRlY2xhcmVkIGN1c3RvbSBjb21tYW5kcyBpbiB5b3VyIGBpbml0YCBmaWxlIHRoYXQgY2FuIGJlIHJ1biBmcm9tIHRoZSBHaXQtcGx1cyBjb21tYW5kIHBhbGV0dGVcIlxuICAgICAgZGlmZkJyYW5jaGVzOlxuICAgICAgICBvcmRlcjogM1xuICAgICAgICB0aXRsZTogXCJTaG93IGRpZmZzIGFjcm9zcyBicmFuY2hlc1wiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIkRpZmZzIHdpbGwgYmUgc2hvd24gZm9yIHRoZSBjdXJyZW50IGJyYW5jaCBhZ2FpbnN0IGEgYnJhbmNoIHlvdSBjaG9vc2UuIFRoZSBgRGlmZiBicmFuY2ggZmlsZXNgIGNvbW1hbmQgd2lsbCBhbGxvdyBjaG9vc2luZyB3aGljaCBmaWxlIHRvIGNvbXBhcmUuIFRoZSBmaWxlIGZlYXR1cmUgcmVxdWlyZXMgdGhlICdzcGxpdC1kaWZmJyBwYWNrYWdlIHRvIGJlIGluc3RhbGxlZC5cIlxuICAgICAgdXNlU3BsaXREaWZmOlxuICAgICAgICBvcmRlcjogNFxuICAgICAgICB0aXRsZTogXCJTcGxpdCBkaWZmXCJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVXNlIHRoZSBzcGxpdC1kaWZmIHBhY2thZ2UgdG8gc2hvdyBkaWZmcyBmb3IgYSBzaW5nbGUgZmlsZS4gT25seSB3b3JrcyB3aXRoIGBEaWZmYCBjb21tYW5kIHdoZW4gYSBmaWxlIGlzIG9wZW4uXCJcbiAgICAgIGF1dG9GZXRjaDpcbiAgICAgICAgb3JkZXI6IDVcbiAgICAgICAgdGl0bGU6IFwiQXV0by1mZXRjaFwiXG4gICAgICAgIHR5cGU6IFwiaW50ZWdlclwiXG4gICAgICAgIGRlZmF1bHQ6IDBcbiAgICAgICAgbWF4aW11bTogNjBcbiAgICAgICAgZGVzY3JpcHRpb246IFwiQXV0b21hdGljYWxseSBmZXRjaCByZW1vdGUgcmVwb3NpdG9yaWVzIGV2ZXJ5IGB4YCBtaW51dGVzIChgMGAgd2lsbCBkaXNhYmxlIHRoaXMgZmVhdHVyZSlcIlxuICAgICAgYXV0b0ZldGNoTm90aWZ5OlxuICAgICAgICBvcmRlcjogNlxuICAgICAgICB0aXRsZTogXCJBdXRvLWZldGNoIG5vdGlmaWNhdGlvblwiXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlNob3cgbm90aWZpY2F0aW9ucyB3aGlsZSBydW5uaW5nIGBmZXRjaCAtLWFsbGA/XCJcbiJdfQ==
