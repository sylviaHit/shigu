/**每日诗词推荐**/
import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    ScrollView,
    Button,
    ImageBackground, Alert
} from 'react-native';
import {service} from "../../utils/service";
import {NavigationActions} from "react-navigation";
import Dimensions from 'Dimensions';
import {actionCreate} from "../../redux/reducer";
import {connect} from "react-redux";
import Loading from '../../utils/Loading';

import {transFun} from '../../utils/fontTransform';

const {toSim, toFan} = transFun;

class Commend extends Component {
    static navigationOptions = {
        title: '',
        header: null,
        // headerTintColor: 'transparent'
        // headerStyle: {
        //     backgroundColor: 'transparent'
        // }
    };

    constructor(props) {
        super(props);
        this.state = {
            currentData: {},
            loading: false
        };
        this.currentData = {};
        this.jieqiRecent = '';
    }

    getData = () => {
        this.state.loading = true;
        service.get('https://www.sojson.com/open/api/lunar/json.shtml').then((response) => {
            if (response && response.message === 'success') {
                let month = response.data.month;
                let day = response.data.day;
                let jieqi = response.data.jieqi;
                let cha = 40;
                for (let key in jieqi) {
                    let item = jieqi[key];
                    if (Math.abs(day - key) < cha) {
                        this.jieqiRecent = item;
                        cha = Math.abs(day - key);
                    }
                }
                let currentPoetry = data[this.jieqiRecent];
                let index = Math.ceil(Math.random() * (currentPoetry.length - 1));
                let keyTitle = currentPoetry[index];
                service.get('https://api.sou-yun.com/api/poem', {
                    key: keyTitle,
                    scope: 2,
                    jsonType: true
                }).then((response) => {
                    if (response.ShiData && response.ShiData.length > 0) {
                        this.setState({
                            currentData: response.ShiData[0],
                            loading: false
                        })
                        // this.currentData = response.ShiData[0];
                    }
                });
            }else{
                Alert.alert('',
                    '数据请求失败o(╥﹏╥)o',
                    [
                        {text: '确定'}
                    ]
                );
                this.setState({
                    loading: false
                })
            }
        });
    }

    componentWillMount() {
        this.getData();
    }

    componentWillReceiveProps(nextProps) {
    }

    /**
     * 前往主页
     */
    goToHome = () => {
        const navigateAction = NavigationActions.navigate({
            routeName: 'Home',
            params: {}
        });
        this.props.navigation.dispatch(navigateAction);
    }

    /**
     * 跳转到作者详情页
     */
    goToAuthorResult = (author) => {

        // const {actionCreate, dispatch} = this.props;
        // dispatch(actionCreate('SET_POETRY_SEARCH_VALUE_ITEM', {
        //     searchValue: author,
        //     item: 'author'
        // }));

        let searchValue = author;
        const {store: {poetry: {data}}} = this.props.store;

        let newData = Object.assign({}, data);

        if (!(newData[searchValue] && newData[searchValue][0])) {
            this.setState({
                loading: true
            })
            service.get('https://api.sou-yun.com/api/poem', {
                key: author,
                scope: 2,
                pageNo: 0,
                jsonType: true
            }).then((response) => {
                //无数据
                if (response === null) {
                    Alert.alert('',
                        '无更多数据',
                        [
                            {text: '确定'}
                        ]
                    );
                    this.setState({
                        loading: false
                    })
                }
                if (response.ShiData && response.ShiData.length > 0) {
                    if (newData && newData[searchValue]) {
                        newData[searchValue][0] = response;
                    } else if (newData && !newData[searchValue]) {
                        newData[searchValue] = [];
                        newData[searchValue][0] = response;
                    }
                    const {actionCreate, dispatch} = this.props;
                    dispatch(actionCreate('SET_POETRY_DATA', {
                        data: newData,
                        currentPage: 0,
                        currentStartPage: 0,
                        searchValue: author,
                        item: 'author'
                    }));

                    this.setState({
                        loading: false
                    })

                    const navigateAction = NavigationActions.navigate({
                        routeName: 'Result',
                        params: {
                            searchValue: searchValue
                        }
                    });
                    this.props.navigation.dispatch(navigateAction);
                }
            });
        } else if (newData[searchValue] && newData[searchValue][0]) {
            const navigateAction = NavigationActions.navigate({
                routeName: 'Result',
                params: {
                    searchValue: searchValue
                }
            });
            this.props.navigation.dispatch(navigateAction);
        }
    }

    render() {
        let id = '', title = '', subTitle = '', preface = '', content = '', author = '', dynasty = '';
        const {currentData} = this.state;
        if (currentData) {
            id = currentData.Id || '';
            title = currentData.Title && toSim(currentData.Title.Content) || '';
            subTitle = currentData.SubTitle && toSim(currentData.SubTitle.Content) || '';
            author = toSim(currentData.Author) || '';
            preface = toSim(currentData.Preface) || '';
            dynasty = toSim(currentData.Dynasty) || '';
            if (currentData.Clauses && currentData.Clauses.length > 0) {
                currentData.Clauses.forEach((item, index) => {
                    if (index % 2 === 1) {
                        content += toSim(item.Content) + '\n';
                    } else {
                        content += toSim(item.Content);
                    }

                });
            }
        }
        return (
            <ImageBackground source={require('../../images/gamebg3.jpeg')}
                             style={{width: screenWidth, height: screenHeight}}>

                {/*<View style={styles.wrap}>*/}
                {
                    this.state.loading ?
                        <Loading/> : null
                }
                    {
                        this.jieqiRecent ?
                            <View style={{width: screenWidth, flexDirection: 'row-reverse', height: 90, padding: 5}}>
                                <View style={{width: 52, height: 82, padding: 5, borderColor: '#ccc', borderWidth: 1, margin: 30}}>
                                    <Text style={{
                                        fontSize: 30,
                                        fontFamily: '华文行楷',
                                        width: 40,
                                        height: 70,
                                        padding: 5,
                                        borderColor: '#ccc',
                                        borderWidth: 1
                                    }}>
                                        {this.jieqiRecent}
                                    </Text>
                                </View>
                            </View>
                            : null
                    }

                    {/*{id ?*/}
                    {/*<ScrollView style={styles.bodyContainer}>*/}
                    {/*<View style={styles.container}>*/}
                    {/*<Text style={styles.allTitle}>*/}
                    {/*{title}{subTitle ? `·${subTitle}` : ''}*/}
                    {/*</Text>*/}
                    {/*<Text style={{ marginTop: 5 }}>{dynasty ? `[${dynasty}]` : ''}  {author}</Text>*/}
                    {/*{ preface ? <Text style={styles.preface}>{preface}</Text> : null }*/}
                    {/*<Text style={styles.content}>{content}</Text>*/}
                    {/*</View>*/}
                    {/*</ScrollView>*/}
                    {/*: null}*/}
                    {
                        id ?
                            <ScrollView style={styles.bodyContainer}>
                                <View style={styles.container}>
                                    <Text style={styles.allTitle}>
                                        {title}{subTitle ? `·${subTitle}` : ''}
                                    </Text>
                                    <View style={{flexDirection: 'row', marginTop: 5}}>
                                        {
                                            dynasty ? <Text style={{fontSize: 12}}>[</Text> : null
                                        }
                                        {
                                            dynasty ?
                                                <Text style={{fontFamily: '华文行楷', fontSize: 16}}>{dynasty}</Text> : null
                                        }
                                        {
                                            dynasty ? <Text style={{fontSize: 12}}>]</Text> : null
                                        }
                                        {
                                            author && author !== '阙名' ?
                                                <TouchableOpacity
                                                    onPress={e => this.goToAuthorResult(String(currentData.Author), e)}>
                                                    <Text style={{
                                                        textDecorationLine: 'underline',
                                                        marginLeft: 3,
                                                        fontFamily: '华文行楷',
                                                        fontSize: 16
                                                    }}>
                                                        {author}
                                                    </Text>
                                                </TouchableOpacity> : null
                                        }

                                    </View>

                                    {preface ? <Text style={styles.preface}>{preface}</Text> : null}
                                    <Text style={styles.content}>{content}</Text>
                                </View>
                            </ScrollView> : null
                    }
                {/*</View>*/}


            </ImageBackground>


        )
    }
}

{/*<ImageBackground source={require('../../images/gamebg.png')}*/
}
{/*style={{width: screenWidth, height: screenHeight}}>*/
}
{/*<TouchableOpacity onPress={this.goToHome}>*/
}
{/*<Text style={{width: 360, textAlign: 'right', color: '#f00', padding: 10, fontSize:18, fontFamily: '华文行楷', textDecorationLine: 'underline'}}>*/
}
{/*跳过*/
}
{/*</Text>*/
}
{/*</TouchableOpacity>*/
}


// </ImageBackground>
function mapStateToProps(state) {
    return {
        store: state // gives our component access to state through props.toDoApp
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch: dispatch,
        actionCreate: actionCreate
    } // here we'll soon be mapping actions to props
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Commend);

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        backgroundColor: '#fff',
        height: screenHeight,
    },
    search: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    bodyContainer: {
        width: screenWidth,
        padding: 0,
        backgroundColor: 'transparent',
    },
    container: {
        width: screenWidth,
        paddingTop: 50,
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    allTitle: {
        marginTop: 10,
        fontSize: 30,
        width: 300,
        textAlign: 'center',
        fontFamily: '华文行楷'
    },
    title: {
        fontSize: 20,
        width: 100,
        borderColor: "black",
        borderWidth: 1,
    },
    preface: {
        width: screenWidth - 60,
        padding: 3,
        marginTop: 10,
        color: '#f00',
        borderRadius: 5,
        backgroundColor: '#faf1cf',
        fontSize: 12,
        lineHeight: 18
    },
    content: {
        marginTop: 10,
        lineHeight: 28,
        fontSize: 18,
        fontFamily: '华文行楷'
    },
    myContainer: {
        marginTop: 30,
        flexDirection: "row",
    },
    inputStyle: {
        width: 280,
        height: 40,
        borderColor: "black",
        borderWidth: 1,
        marginLeft: 5,
        fontSize: 12,
        fontFamily: '华文行楷'
    },
    btn: {
        width: 85,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "green",
    },
    wordC: {
        color: "white",
        fontSize: 18,
        fontFamily: '华文行楷'
    }
});

const data = {
    '立春': ['咏柳', '木兰花立春日作', '京中正月七日立春', '立春日酬钱员外曲江同行见赠', '立春日游苑迎春', '立春偶成'],
    '雨水': ['春夜喜雨', '早春呈水部张十八员外', '初春小雨', '夜雨寄北', '春雨', '临安春雨初霁'],
    '惊蛰': ['拟古仲春遘时雨', '走笔谢孟谏议寄新茶', '观田家', '义雀行和朱评事'],
    '春分': ['春日', '踏莎行', '赠范晔', '春分投简阳明洞天作', '春分与诸公同宴呈陆三十四郎中', '无梦令龙阳观春分其间作', '蝶恋花', '画堂春'],
    '清明': ['清明', '寒食上冢', '途中寒食', '闾门即事', '湖寺清明夜遣怀', '清明后登城眺望', '清明日曲江怀友', '清明即事', '清明日忆诸弟', '长安清明'],
    '谷雨': ['春晓', '晚春田园杂兴', '惜牡丹花', '与崔二十一游镜湖寄包贺二公', '白牡丹', '老圃堂', '春中途中寄南巴崔使君', '见二十弟倡和花字漫兴五首'],
    '立夏': ['山亭夏日', '初夏', '客中初夏', '立夏前二日作', '四月旦作时立夏已十余日', '山中立夏用坐客韵'],
    '小满': ['渭川田家', '自桃川至辰州绝句四十有二', '古田园四时乐春夏二首其二', '农事诗'],
    '芒种': ['观刈麦', '梅雨五绝其二', '时雨', '北固晚眺', '春夏之交衰病相仍过芒种始健戏作', '芒种後经旬无日不雨偶得长句', '芒种后积雨骤冷'],
    '夏至': ['竹枝词杨柳青青江水平', '积雨辋川庄作', '竹枝词', '夏至避暑北池', '和梦得夏至忆苏州呈卢宾客', '夏日杂兴'],
    '小暑': ['心闲即清凉', '赠别王侍御赴上都', '喜夏', '小暑戒节南巡', '小暑六月节', '夏日南亭怀辛大', '幸有心期当小暑'],
    '大暑': ['热散由心静', '鹧鸪天', '晓出净慈寺送林子方', '毒热寄简崔评事十六弟', '销夏', '夏日闲放'],
    '立秋': ['城中晚夏思山', '立秋前一日览镜'],
    '处暑': ['早秋山中作', '早秋曲江感怀', '悯农', '秋日喜雨题周材老壁', '处暑后风雨'],
    '白露': ['金陵城西楼月下吟', '月夜忆舍弟', '蒹葭', '情诗', '南湖晚秋', '宿烟含白露', '秋题牡丹丛', '凉夜有怀', '衰荷'],
    '秋分': ['秋词二首其二', '秋词二首其一', '和侃法师三绝诗二', '送僧归金山寺', '中秋对月', '夜喜贺兰三见访', '再过王辂原居纳凉'],
    '寒露': ['秋兴八首其七', '与胡兴安夜别', '败荷鹡鸰图', '八月十九日试院梦冲卿', '玉蝴蝶', '晚景怅然简二三子', '花游曲'],
    '霜降': ['村夜', '霜降', '谪居', '岁晚', '赋得九月尽', '九日登李明府北楼'],
    '立冬': ['初冬夜饮', '古诗十九首之孟冬寒气至', '立冬日作', '立冬日野外行吟'],
    '小雪': ['小雪', '小雪日戏题绝句'],
    '大雪': ['北风行', '问刘十九', '夜雪'],
    '冬至': ['邯郸冬至夜思家作', '燕京岁时记', '小至'],
    '小寒': ['冬夜寄温飞卿', '山园小梅', '小寒食舟中作', '窦园醉中前后五绝句', '早发竹下', '窗前木芙蓉', '小园独酌'],
    '大寒': ['寒夜', '苦寒吟', '大寒出江陵西门', '大寒步至东坡赠巢三', '岁寒知松柏', '大寒吟'],
}
