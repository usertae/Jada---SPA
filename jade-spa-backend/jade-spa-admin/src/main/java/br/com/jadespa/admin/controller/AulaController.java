package br.com.jadespa.admin.controller;

import br.com.jadespa.admin.model.Aula;
import br.com.jadespa.admin.repository.AulaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aulas")
@CrossOrigin(origins = "*")
public class AulaController {

    private final AulaRepository repository;

    public AulaController(AulaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Aula> listar() {
        return repository.findAll();
    }
}