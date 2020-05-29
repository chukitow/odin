let application : Application;
class Application {
  public isQuiting : boolean = false;
  public isRecording : boolean = false;
  public isDownloading : boolean = false;
  public screen: ScreenPoint = null; 
}

if(!application) {
  application = new Application();
}

export default application;
