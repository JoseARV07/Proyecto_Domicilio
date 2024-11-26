import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { AsideComponent } from './aside/aside.component';
import { Subject } from 'rxjs';

interface Message {
  severity: string;
  summary: string;
  detail: string;
  icon: string;
  id: number;
  hiding: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    AsideComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('aside') aside!: AsideComponent;
  
  title = 'frontend-proyecto';
  messages: Message[] = [];
  private messageSubject = new Subject<Omit<Message, 'icon' | 'id' | 'hiding'>>();
  private messageIdCounter = 0;

  constructor(private router: Router) {
    this.messageSubject.subscribe(message => {
      this.addMessageWithIcon(message);
      setTimeout(() => this.removeMessage(this.messages[0]), 3000);
    });
  }

  isAuthRoute(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }

  addMessage(message: Omit<Message, 'icon' | 'id' | 'hiding'>) {
    this.messageSubject.next(message);
  }

  private addMessageWithIcon(message: Omit<Message, 'icon' | 'id' | 'hiding'>) {
    const iconMap: { [key: string]: string } = {
      success: '✅',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    const newMessage: Message = {
      ...message,
      icon: iconMap[message.severity] || '📩',
      id: this.messageIdCounter++,
      hiding: false
    };
    this.messages.unshift(newMessage);
  }

  removeMessage(message: Message) {
    const index = this.messages.findIndex(m => m.id === message.id);
    if (index > -1) {
      this.messages[index].hiding = true;
      setTimeout(() => {
        this.messages.splice(index, 1);
      }, 300);
    }
  }
}
