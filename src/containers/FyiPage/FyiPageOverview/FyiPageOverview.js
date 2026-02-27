import React, { Component } from 'react';
import { compose } from 'redux';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';

class FyiPageOverviewComponent extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
        <div>
            Test FyiPage Overview
        </div>
        );
    }

}

const FyiPageOverview = compose(injectIntl)(FyiPageOverviewComponent);

FyiPageOverview.displayName = 'FyiPageOverview';

export default FyiPageOverview;