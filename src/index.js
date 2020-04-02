const request = require("request-promise");
const {
  QMainWindow,
  QLabel,
  FlexLayout,
  QPlainTextEdit,
  QPushButton,
  QPushButtonEvents,
  QWidget,
  QLineEdit,
  QApplication,
  QKeyEvent,
  KeyboardModifier,
  Key,
  QFont
} = require('@nodegui/nodegui');

const file = require('./file.js');
const style = require('./style.js');
const _timeline = require('./timeline.js');
const _checkboxs = require('./checkboxs.js');
const _post_view_area = require('./postview.js');
const Client = require('./client.js');
const client = new Client();
const default_font = new QFont('sans', 9);

const win = new QMainWindow();
win.setWindowTitle('TenCha');
win.resize(460, 700);

const rootView = new QWidget();
const rootViewLayout = new FlexLayout();
rootView.setObjectName('rootView');
rootView.setLayout(rootViewLayout);

const postArea = new QWidget();
const postAreaLayout = new FlexLayout();
postArea.setObjectName('postArea');
postArea.setLayout(postAreaLayout);

const statusLabel = new QLabel();
statusLabel.setWordWrap(true);
statusLabel.setFont(default_font);
statusLabel.setText('ログインチェック中...');
statusLabel.setObjectName('statusLabel');

const postTextInput = new QPlainTextEdit();
postTextInput.setObjectName('postTextInput');
postTextInput.setReadOnly(false);
postTextInput.setWordWrapMode(3);
postTextInput.setFont(default_font);
postTextInput.setPlaceholderText('言いたいことは？');

postAreaLayout.addWidget(postTextInput);

const timelineControlsArea = new QWidget();
const timelineControlsAreaLayout = new FlexLayout();
timelineControlsArea.setObjectName('timelineControlsArea');
timelineControlsArea.setLayout(timelineControlsAreaLayout);

const postButton = new QPushButton();
postButton.setText('Post!');
postButton.setObjectName('postButton');
postAreaLayout.addWidget(postButton);

postButton.addEventListener('clicked', () =>{
  var body = postTextInput.toPlainText();

  if(!body){
    statusLabel.setText('本文入れてね');
    return;
  }

  var data = { text: body };
  statusLabel.setText('投稿中...');
  client.call('notes/create', data).then(() => {
      statusLabel.setText('投稿成功!');
      postTextInput.setPlainText('');
      postTextInput.update();
  }).catch((err) => {
      console.log(err);
      statusLabel.setText(err.error.error.message);
  });
});

postTextInput.addEventListener('KeyPress', (key) => {
    var qkey = new QKeyEvent(key);
    if(qkey.modifiers() != KeyboardModifier.ControlModifier) return;
    if(!(
        qkey.key() == Key.Key_Enter ||
        qkey.key() == Key.Key_Return
    )) return;

    postButton.click();
});

var timeline = new _timeline();
var postViewArea = new _post_view_area();
var checkboxs = new _checkboxs();
var timeline_auto_select = checkboxs.get('timeline_auto_select');

timeline.set_auto_select_check(timeline_auto_select);
timeline.set_post_view(postViewArea);

timelineControlsAreaLayout.addWidget(timeline_auto_select);

rootViewLayout.addWidget(postViewArea.get_widget());
rootViewLayout.addWidget(timeline.get_widget());
rootViewLayout.addWidget(timelineControlsArea);
rootViewLayout.addWidget(postArea);
rootViewLayout.addWidget(statusLabel);

style.add_style(rootView, './style/index.css');

win.setCentralWidget(rootView);
win.show();

client.login().then(() => {
    timeline.start_streaming(statusLabel, client);
    statusLabel.setText('ログイン成功!');
});

global.win = win;
