import React from 'react';
import { TokenProvider, ChatManager } from '@pusher/chatkit';
import 'semantic-ui-css/semantic.min.css';
import { Segment, Grid } from 'semantic-ui-react';

import Chat from './Chat'
import UserInfo from './UserInfo';

//[MUST]chatmanager가 만들어지는 사이클 공부하기
class Lobby extends React.Component{
    constructor(props){
        super(props);

        this.state={
            currentUser : '',
            joined: [],
            joinable: []
        };

        this.chatManager = new ChatManager({
            instanceLocator: 'v1:us1:a793e5d7-f35e-41c4-9373-544efaf68cf2',
            tokenProvider: new TokenProvider({
                url: "http://localhost:4000/auth",
            }),
            userId: props.username
        });

        this.chatManager.connect().then(currentUser => {
            this.setState({
                currentUser: currentUser
            });

            //Lobby를 찾고 들어간다.
            currentUser.getJoinableRooms().then((rooms) =>{
                let lobby = rooms.find((room) => room.name === 'Lobby');
                if(lobby){
                    currentUser.joinRoom({roomId: lobby.id});
                } else {
                    lobby = currentUser.rooms.find((room) => room.name === 'Lobby');
                }
                if(lobby){
                    this.setState({
                        lobbyId: lobby.id,
                        activeRoom: lobby.id
                    });
                }

                //왜 하는건지 모르겠음
                setInterval(this._pollRooms.bind(this),5000);
                this._pollRooms();

            }).catch((e) => {
                console.log('[Lobby.js] getJoinableRooms error')
                console.log(e);
            });
        })
    }

    _pollRooms() {
        const { currentUser } = this.state;

        currentUser.getJoinableRooms()
            .then((rooms) => {
                this.setState({
                    joined: currentUser.rooms,
                    joinable: rooms
                })
            });
    }

    render(){
        const {currentUser} = this.state;
        let chat;
        let userInfo;
        
        if(currentUser !== ''){
            const room = currentUser.rooms.find((room) => room.id === this.state.activeRoom);
            userInfo = <UserInfo username={this.props.username}/>
            if(room){
                chat = <Chat user={currentUser} room={room} key={room.id}/>
            }
        }

        return(
 
            <Segment>
                <h1>Lobby</h1>
                <Grid>
                    <Grid.Column width={10}>
                    </Grid.Column>
                    <Grid.Column width={5}>
                        <Grid divided='vertically'>
                            <Grid.Row>
                                <Grid.Column>{ userInfo }</Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>{ chat }</Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>
                </Grid>
            </Segment>
        )
    }
}

export default Lobby;