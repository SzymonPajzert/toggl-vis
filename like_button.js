'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { liked: false };
    }

    render() {
        var message = 'Regularize';
        if (this.state.liked) {
            message = 'Regularized';
        }

        return e(
            'button',
            { onClick: () => {
                console.log("Clicked");
                this.setState({ liked: !this.state.liked }) }
            },
            message
        );
    }
}

const domContainer = document.querySelector('#like_button_container');
ReactDOM.render(e(LikeButton), domContainer);