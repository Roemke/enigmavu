#include <pebble.h>
#include "communication.h"

//codes needed here and in c-programm
//seems to be neccessary but not nice
//codes for the vuplus
#define KEY_POWER 116
#define KEY_VOLUP 115
#define KEY_VOLDOWN 114
#define KEY_ARRUP 103
#define KEY_ARRDOWN 108
#define KEY_OK 352
#define KEY_INFO 358
#define KEY_EXIT 1
//codes for communication 
#define KEY_CONTROL 1000

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "received message - why :-)");
} 
static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  //APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}

//send key to phone
static void sendSignal(int key)
{
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  if (iter == NULL) {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "null iter, can't send");
  }
  else
  {
    Tuplet tuple =  TupletInteger(KEY_CONTROL, key);
    dict_write_tuplet(iter, &tuple);
    dict_write_end(iter);
    app_message_outbox_send(); //ok laeuft pebble-js-app.js reagiert
  }	
}
void sendPower(){sendSignal(KEY_POWER);}
void sendVolUp(){sendSignal(KEY_VOLUP);}
void sendVolDown(){sendSignal(KEY_VOLDOWN);}
void sendArrowUp(){sendSignal(KEY_ARRUP);}
void sendArrowDown(){sendSignal(KEY_ARRDOWN);}
void sendOK(){sendSignal(KEY_OK);}
void sendExit(){sendSignal(KEY_EXIT);}
 
void initCommunication(void)
{
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);
  // Open AppMessage
  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());	
}
