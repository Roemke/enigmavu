#include <pebble.h>
#include "control.h"
#include "communication.h"


void handle_init(void) {
	initCommunication();
	show_control();//creates s_window and layers
  bind_clicks(); 

}

void handle_deinit(void) {
  //text_layer_destroy(text_layer);
  //window_destroy(my_window);
	hide_control();
}

int main(void) {
  handle_init();
  app_event_loop();
  handle_deinit();
}
