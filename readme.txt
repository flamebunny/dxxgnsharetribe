//Email Templates Cli

flex-cli process list -m desxgn-dev

//Pull
flex-cli process pull --process default-purchase --version 1 --path process -m desxgn-dev

/process/templates created

//make changes

//Preview changes
flex-cli notifications preview --template process/templates/purchase-order-disputed -m desxgn-dev

//Send file
flex-cli notifications send --template process/templates/purchase-order-disputed -m desxgn-dev

//Push changes
flex-cli process push --path process --process default-purchase -m desxgn-dev

//Update alias
flex-cli process update-alias --process default-purchase --alias release-1 --version 2 -m desxgn-dev


