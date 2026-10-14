import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-help',
  standalone: false,
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() { }

  downloadPdf() {
    // Create a hidden anchor element
    const link = document.createElement('a');
    link.href = '/assets/EmployeeHelp.pdf';
    link.download = 'EmployeeHelp.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
