package br.com.jadespa.admin.controller;

import br.com.jadespa.admin.model.Plano;
import br.com.jadespa.admin.service.PlanoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planos")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class PlanoController {

    private final PlanoService planoService;

    public PlanoController(PlanoService planoService) {
        this.planoService = planoService;
    }

    @GetMapping
    public ResponseEntity<List<Plano>> listarPlanos() {
        return ResponseEntity.ok(planoService.listarPlanosAtivos());
    }
}